import prompts from "prompts";
import { Command } from "commander";
import { Logger } from "../utils/logger.js";
import { startSpinner } from "../utils/spinner.js";
import { promptYesNo } from "../utils/input-handler.js";
import { Boxer } from "../utils/boxer.js";
import chalk from "chalk";
import { NEARAI_COLORS } from "../utils/colors.js";

export const createCmd = new Command("create")
    .description("Create a new NEAR AI TypeScript project")
    .argument("[projectName]", "Optional name of the project")
    .action(async (projectName: string | undefined) => {

        Boxer.box(
            "Agent Creator",
            chalk.hex(NEARAI_COLORS['teal']).bold("Let's create a new agent! 🦾\n") +
            chalk.hex(NEARAI_COLORS['default'])("We'll need some basic information to get started."),
            "teal"
        );

        Boxer.box(
            "Agent Name Rules",
            chalk.hex(NEARAI_COLORS['white'])("Choose a unique name for your agent using only:\n\n") +
            chalk.hex(NEARAI_COLORS['default'])("  • letters\n") +
            chalk.hex(NEARAI_COLORS['default'])("  • numbers\n") +
            chalk.hex(NEARAI_COLORS['default'])("  • dots (.)\n") +
            chalk.hex(NEARAI_COLORS['default'])("  • hyphens (-)\n") +
            chalk.hex(NEARAI_COLORS['default'])("  • underscores (_)\n\n") +
            chalk.hex(NEARAI_COLORS['teal'])("Examples: 'code-reviewer', 'data.analyzer', 'text_summarizer'"),
            "blue"
        );

        // If user didn't pass a name, let's prompt for it:
        let finalName = projectName;
        if (!finalName) {
            const response = await prompts({
                type: "text",
                name: "value",
                message: "Enter a name for your project:",
                initial: "my-nearai-agent",
            });
            finalName = response.value;
        }

        Logger.info(`Preparing to create project: ${finalName}`);

        // Confirm creation
        const confirm = await promptYesNo(`Do you want to create the '${finalName}' project?`);
        if (!confirm) {
            Logger.warn("Project creation canceled by user.");
            return;
        }

        // Show spinner
        const spinner = startSpinner("Scaffolding new project...");
        try {
            // Simulate some work
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // @TODO - Implement project scaffolding here

            spinner.succeed("Done scaffolding!");
            Logger.success(`Project '${finalName}' created successfully!`);
        } catch (err: any) {
            spinner.fail("Failed to create project!");
            Logger.error(err?.message || "Unknown error");
            process.exit(1);
        }
    });
