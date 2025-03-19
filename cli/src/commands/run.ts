import { Command } from "commander";
import prompts from "prompts";
import { Logger } from "../utils/logger.js";
import { startSpinner } from "../utils/spinner.js";
import { promptYesNo, readMultiLineInput } from "../utils/input-handler.js";
import { Boxer } from "../utils/boxer.js";
import chalk from "chalk";
import { NEARAI_COLORS } from "../utils/colors.js";

import { runAgent, runAgentOnePass } from "../../../core/dist/runner.js";

// @TODO - Remove this after implementing actual agent runner
async function runAgentStub(agentPath: string): Promise<void> {
    // Simulate a short load
    await new Promise(resolve => setTimeout(resolve, 1500));
}

export const runCmd = new Command("run")
    .description("Run your NEARAI TypeScript agent in a multi-line interactive CLI")
    .argument("[agentPath]", "Optional path to your agent .ts file")
    .action(async (agentPath: string | undefined) => {
        Boxer.box(
            "Agent Runner",
            chalk.hex(NEARAI_COLORS["teal"]).bold("Time to run your NEAR AI agent!\n") +
            chalk.hex(NEARAI_COLORS["default"])(
                "We'll gather the agent path and configuration."
            ),
            "teal"
        );

        // Step 1: Prompt for agent path
        let finalAgentPath = agentPath || "";
        if (!finalAgentPath) {
            const response = await prompts({
                type: "text",
                name: "value",
                message: "Enter the path to your agent file:",
                initial: "../examples/simple-agent/agent.ts",
            });
            finalAgentPath = response.value;
        }

        Logger.info(`Preparing to run agent at: ${finalAgentPath}`);

        // Confirm agent run
        const confirm = await promptYesNo(
            `Do you want to run the agent located at '${finalAgentPath}'?`
        );
        if (!confirm) {
            Logger.warn("Agent run canceled by user.");
            return;
        }

        // Step 2: Simulate agent loading
        const spinner = startSpinner("Starting agent (stub)...");
        try {
            await runAgentStub(finalAgentPath);
            spinner.succeed("Agent ready!");
            Logger.success(`Agent '${finalAgentPath}' is running.\n`);

            // Step agent environment init
            // @TODO - Implement
            // const spinner = startSpinner("Initializing agent environment...");
            // try {
            //     // The runAgent function purely sets up config + environment (no UI)
            //     await runAgent(finalAgentPath);
            //     spinner.succeed("Environment ready!");
            //     Logger.success(`Agent '${finalAgentPath}' environment initialized.\n`);
            // } catch (err: any) {
            //     spinner.fail("Failed to run agent!");
            //     Logger.error(err?.message || "Unknown error");
            //     process.exit(1);
            // }

            // Step 3: Enter interactive loop
            Logger.info(
                "Type multiple lines. Enter /done (or blank line) to send message. Enter /exit to quit.\n"
            );

            while (true) {
                const userMessage = await readMultiLineInput();
                if (!userMessage) {
                    Logger.warn("Exiting interactive mode.");
                    break;
                }

                // Show spinner as agent is thinking
                const thinking = startSpinner("Agent is thinking...");
                await new Promise(resolve => setTimeout(resolve, 1000));
                thinking.succeed("Agent responded!");

                // @TODO - Implement
                // const agentOutput = await runAgentOnePass(finalAgentPath);
                // Logger.info(
                //     chalk.hex(NEARAI_COLORS["teal"])("[Agent Output]: \n") +
                //     chalk.hex(NEARAI_COLORS["white"])(agentOutput || "[No output]")
                // );

                // Show agent response
                Logger.info(
                    chalk.hex(NEARAI_COLORS["teal"])("[Agent Output]: \n")
                );
            }

            Logger.info("Session ended. Goodbye!");
        } catch (err: any) {
            spinner.fail("Failed to run agent!");
            Logger.error(err?.message || "Unknown error");
            process.exit(1);
        }
    });