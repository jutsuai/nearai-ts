import { Command } from "commander";
import prompts from "prompts";
import { Logger } from "../utils/logger.js";
import { startSpinner } from "../utils/spinner.js";
import { promptYesNo } from "../utils/input-handler.js";
import { Boxer } from "../utils/boxer.js";
import chalk from "chalk";
import { NEARAI_COLORS } from "../utils/colors.js";

// @TODO - Update import to SDK package once exists
import { runAgent } from "../../../core/dist/runner.js";

export const runCmd = new Command("run")
    .description("Run your NEARAI TypeScript agent")
    .argument("[agentPath]", "Optional path to your agent .ts file")
    .action(async (agentPath: string | undefined) => {
        // Display a header box
        Boxer.box(
            "Agent Runner",
            chalk.hex(NEARAI_COLORS["teal"]).bold("Time to run your NEAR AI agent!\n") +
            chalk.hex(NEARAI_COLORS["default"])("We'll gather the agent path and configuration."),
            "teal"
        );

        // If the user didn't provide an agent path, prompt them
        let finalAgentPath = agentPath as string;
        if (!finalAgentPath) {
            const response = await prompts({
                type: "text",
                name: "value",
                message: "Enter the path to your agent file:",
                initial: "agents/agent.ts"
            });
            finalAgentPath = response.value;
        }

        Logger.info(`Preparing to run agent at: ${finalAgentPath}`);

        // Confirm run
        const confirm = await promptYesNo(`Do you want to run the agent located at '${finalAgentPath}'?`);
        if (!confirm) {
            Logger.warn("Agent run canceled by user.");
            return;
        }

        // Show spinner
        const spinner = startSpinner("Starting agent...");
        try {
            // Call your runAgent function
            await runAgent(finalAgentPath);

            spinner.succeed("Agent has finished running!");
            Logger.success(`Agent '${finalAgentPath}' ran successfully!`);

            // Optional next steps
            Logger.info(`\nNext steps:\n  • Modify your agent code\n  • Re-run 'nearai run'\n`);
        } catch (err: any) {
            spinner.fail("Failed to run agent!");
            Logger.error(err?.message || "Unknown error");
            process.exit(1);
        }
    });
