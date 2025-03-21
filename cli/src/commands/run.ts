import { Command } from "commander";
import prompts from "prompts";
import { Logger } from "../utils/logger.js";
import { startSpinner } from "../utils/spinner.js";
import { promptYesNo, readMultiLineInput } from "../utils/input-handler.js";
import { Boxer } from "../utils/boxer.js";
import chalk from "chalk";
import { NEARAI_COLORS } from "../utils/colors.js";

// @TODO - Update so loads from the package ("nearai-ts") instead of local
import { runner } from "../../../core/dist/runner.js";
import { env } from "../../../core/dist/sdk/environment.js";

export const runCmd = new Command("run")
    .description("Run your NEARAI TypeScript agent in a multi-line interactive CLI")
    .argument("[agentPath]", "Optional path to your agent .ts file")
    .action(async (agentPath: string | undefined) => {
        Boxer.box(
            "Agent Runner",
            chalk.hex(NEARAI_COLORS["teal"]).bold("Time to run your NEAR AI agent!\n") +
            chalk.hex(NEARAI_COLORS["default"])("We'll gather the agent path and configuration."),
            "teal"
        );

        let finalAgentPath = agentPath || "";
        if (!finalAgentPath) {
            const response = await prompts({
                type: "text",
                name: "value",
                message: "Enter the path to your agent file:",
                initial: "./dist/template/agent.js",
            });
            finalAgentPath = response.value;
        }

        Logger.info(`Preparing to run agent at: ${finalAgentPath}`);

        const confirm = await promptYesNo(
            `Do you want to run the agent located at '${finalAgentPath}'?`
        );
        if (!confirm) {
            Logger.warn("Agent run canceled by user.");
            return;
        }

        const spinner = startSpinner("Starting agent...");
        try {
            await runAgentCore(finalAgentPath);
            spinner.succeed("Agent ready!");
            Logger.success(`Agent '${finalAgentPath}' is running.\n`);

            Logger.info(
                "Type multiple lines. Enter /done (or blank line) to send. Enter /exit to quit.\n"
            );

            const agentModule = await importAgentModule(finalAgentPath);

            while (true) {
                const userMessage = await readMultiLineInput();
                if (!userMessage) {
                    Logger.warn("Exiting interactive mode.");
                    break;
                }

                const thinking = startSpinner("Agent is thinking...");
                env().setLocalUserMessage(userMessage);

                let output: string | undefined;
                if (typeof agentModule.default === "function") {
                    output = await agentModule.default({});
                } else if (typeof agentModule.Agent === "function") {
                    output = await agentModule.Agent({});
                }
                thinking.succeed("Agent responded!");

                Logger.info(
                    chalk.hex(NEARAI_COLORS["teal"])("\n[Agent Output]\n") +
                    chalk.hex(NEARAI_COLORS["white"])(output || "[No output]")
                );
            }

            Logger.info("Session ended. Goodbye!");
        } catch (err: any) {
            spinner.fail("Failed to run agent!");
            Logger.error(err?.message || "Unknown error");
            process.exit(1);
        }
    });

async function runAgentCore(agentPath: string) {
    const oldArgv = [...process.argv];
    try {
        process.argv[2] = agentPath;
        process.argv[3] = "";
        await runner();
    } finally {
        process.argv.length = 0;
        oldArgv.forEach((arg) => process.argv.push(arg));
    }
}

async function importAgentModule(agentPath: string) {
    const { resolve } = await import("node:path");
    const absoluteAgentPath = resolve(agentPath);
    return await import(absoluteAgentPath);
}
