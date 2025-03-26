import { Command } from "commander";
import prompts from "prompts";
import { Logger } from "../utils/logger.js";
import { startSpinner } from "../utils/spinner.js";
import { promptYesNo, readMultiLineInput } from "../utils/input-handler.js";
import { Boxer } from "../utils/boxer.js";
import chalk from "chalk";
import { NEARAI_COLORS } from "../utils/colors.js";
import { env, runner } from "@jutsuai/nearai-ts-core";
import { globby } from "globby";
import fs from "fs";
import path from "path";
import { build } from "esbuild";

export const runCmd = new Command("run")
    .description("Run your NEARAI TypeScript agent in a multi-line interactive CLI")
    .argument("[agentPath]", "Optional path to your agent .ts/.js file")
    .action(async (agentPath: string | undefined) => {
        Boxer.box(
            "Agent Runner",
            chalk.hex(NEARAI_COLORS["teal"]).bold("Time to run your NEAR AI agent!\n") +
            chalk.hex(NEARAI_COLORS["default"])("We'll gather the agent path and configuration."),
            "teal"
        );

        let finalAgentPath: any = agentPath;

        if (!finalAgentPath) {
            const matches = await globby(
                ["agent.{ts,js}", "**/agents/agent.{ts,js}"],
                { gitignore: true, absolute: true }
            );

            if (matches.length > 0) {
                const { value: selectedPath } = await prompts({
                    type: "select",
                    name: "value",
                    message: "Select an agent to run:",
                    choices: matches.map(file => ({
                        title: path.relative(process.cwd(), file),
                        value: file
                    })),
                });
                finalAgentPath = selectedPath;
            } else {
                const { value: manualPath } = await prompts({
                    type: "text",
                    name: "value",
                    message: "Enter the path to your agent file:",
                    initial: "agent.ts"
                });

                if (!manualPath || !fs.existsSync(manualPath)) {
                    Logger.error(`Agent file '${manualPath}' not found.`);
                    process.exit(1);
                }

                finalAgentPath = manualPath;
            }
        }

        // Transpile agent.ts to agent.js if needed
        if (finalAgentPath.endsWith(".ts")) {
            const agentJsPath = finalAgentPath.replace(/\.ts$/, ".js");
            if (!fs.existsSync(agentJsPath)) {
                Logger.info(`Transpiling ${finalAgentPath} to ${agentJsPath}...`);
                try {
                    await build({
                        entryPoints: [finalAgentPath],
                        outfile: agentJsPath,
                        bundle: false,
                        format: "esm",
                        platform: "node",
                        sourcemap: false,
                        logLevel: "error"
                    });
                    Logger.success(`Transpiled to ${agentJsPath}`);
                } catch (err: any) {
                    Logger.error(`Transpile failed: ${err.message}`);
                    process.exit(1);
                }
            }
            finalAgentPath = agentJsPath;
        }

        // Load the runner module and run the agent
        try {
            const { agentConfig, agentModule } = await callRunner(finalAgentPath);
            Logger.info(
                "Type multiple lines. Enter /done (or blank line) to send. Enter /exit to quit.\n"
            );

            while (true) {
                const userMessage = await readMultiLineInput();
                if (!userMessage) {
                    Logger.warn("Exiting interactive mode.");
                    break;
                }

                const thinking = startSpinner("");
                env().setLocalUserMessage(userMessage);

                let output: string | undefined;
                if (typeof agentModule.default === "function") {
                    output = await agentModule.default(agentConfig);
                } else if (typeof agentModule.Agent === "function") {
                    output = await agentModule.Agent(agentConfig);
                }

                thinking.stop()
                Logger.bot(
                    chalk.hex(NEARAI_COLORS["yellow"])((output || "[No output]") + "\n")
                );
            }

            Logger.info("Session ended. Goodbye!");
        } catch (err: any) {
            Logger.error(err?.message || "Unknown error");
            process.exit(1);
        }
    });

async function callRunner(agentPath: string) {
    const oldArgv = [...process.argv];
    let result;
    try {
        process.argv[2] = agentPath;
        process.argv[3] = "";
        result = await runner();
    } finally {
        process.argv.length = 0;
        oldArgv.forEach(arg => process.argv.push(arg));
    }
    return result;
}
