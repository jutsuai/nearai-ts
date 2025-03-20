import { Command } from "commander";
import prompts from "prompts";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

import { Logger } from "../utils/logger.js";
import { startSpinner } from "../utils/spinner.js";
import { promptYesNo } from "../utils/input-handler.js";
import { Boxer } from "../utils/boxer.js";
import chalk from "chalk";
import { NEARAI_COLORS } from "../utils/colors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This is where we store our template files
const TEMPLATE_DIR = path.resolve(__dirname, "../template");

export const createCmd = new Command("create")
    .description("Create a new NEARAI TypeScript agent project")
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

        // If user didn't pass a name, prompt them
        let finalName = projectName as string;
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
            // Create the new folder in the current working directory
            const newProjectPath = path.join(process.cwd(), finalName);
            await fs.mkdir(newProjectPath, { recursive: true });

            // Copy agent.ts from template
            const agentTsSource = await fs.readFile(
                path.join(TEMPLATE_DIR, "agent.ts"),
                "utf-8"
            );
            await fs.writeFile(
                path.join(newProjectPath, "agent.ts"),
                agentTsSource,
                "utf-8"
            );

            // Copy metadata.json, override the "name" field
            const metadataSource = await fs.readFile(
                path.join(TEMPLATE_DIR, "metadata.json"),
                "utf-8"
            );
            const metadataObj = JSON.parse(metadataSource);
            metadataObj.name = finalName;

            // Copy package.json from template
            const packageJsonSource = await fs.readFile(
                path.join(TEMPLATE_DIR, "package.json"),
                "utf-8"
            );
            const packageJsonObj = JSON.parse(packageJsonSource);
            packageJsonObj.name = finalName;

            // @TODO
            // Update script with further functionality, e.g. set "description" or "tags"
            // metadataObj.description = "A brand new TypeScript agent for NEAR AI!";

            const updatedMetadata = JSON.stringify(metadataObj, null, 2);
            await fs.writeFile(
                path.join(newProjectPath, "metadata.json"),
                updatedMetadata,
                "utf-8"
            );

            // 8) Mark spinner as succeed
            spinner.succeed("Done scaffolding!");
            Logger.success(`Project '${finalName}' created successfully!`);

            // Maybe guide user on next steps
            Logger.info(`\nNext steps:\n  cd ${finalName}\n  nearai-ts run\n`);
        } catch (err: any) {
            spinner.fail("Failed to create project!");
            Logger.error(err?.message || "Unknown error");
            process.exit(1);
        }
    });
