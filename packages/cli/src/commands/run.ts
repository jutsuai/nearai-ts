import { Command } from "commander";
import prompts from "prompts";
import { Logger } from "../utils/logger.js";
import { startSpinner } from "../utils/spinner.js";
import { readMultiLineInput } from "../utils/input-handler.js";
import { Boxer } from "../utils/boxer.js";
import chalk from "chalk";
import { NEARAI_COLORS } from "../utils/colors.js";
import { runner, Agent } from "@jutsuai/nearai-ts-core";
import { globby } from "globby";
import fs from "fs";
import path from "path";

export const runCmd = new Command("run")
    .description("Run your NEARAI TypeScript agent in a multi-line interactive CLI")
    .argument("[agentPath]", "Optional path to your agent .ts file")
    .option("--local", "Use local dev environment (http://localhost:8081/v1)")
    .action(async (agentPath: string | undefined, options: { local?: boolean }) => {
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

        // Load the runner module and run the agent
        try {
            Logger.info(
                "Type multiple lines. Enter blank line to send. Enter /exit to quit.\n"
            );

            // Load the agent module
            const { agentConfig, agentModule } = await callRunner(finalAgentPath!, options.local);
            const agent = new Agent(agentConfig);
            const agentEnv = agent.getEnvironment();

            while (true) {
                const userMessage = await readMultiLineInput();
                if (!userMessage) {
                    continue;
                }

                const thinking = startSpinner("");

                let output: string | undefined;
                if (typeof agentModule.default === "function") {
                    agentEnv.setLocalUserMessage(userMessage);
                    output = await agentModule.default(agent, agentConfig);
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

async function callRunner(agentPath: string, useLocal?: boolean) {
    const oldArgv = [...process.argv];
    let result;
    try {
        process.argv[2] = agentPath;
        process.argv[3] = "";

        // If user passed --local, push it so runner() sees it
        if (useLocal) {
            process.argv.push("--local");
        }
        result = await runner();
    } finally {
        process.argv.length = 0;
        oldArgv.forEach(arg => process.argv.push(arg));
    }
    return result;
}
