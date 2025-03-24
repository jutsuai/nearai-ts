import { Command } from "commander";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import chalk from "chalk";
import prompts from "prompts";
import { globby } from "globby";
import ignore from "ignore";

import { Logger } from "../utils/logger.js";
import { startSpinner } from "../utils/spinner.js";
import { promptYesNo } from "../utils/input-handler.js";
import { Boxer } from "../utils/boxer.js";
import { NEARAI_COLORS } from "../utils/colors.js";
import { registry } from "../utils/registry.js";
import { getAuthNamespace } from "../utils/auth.js";

const __filename = fileURLToPath(import.meta.url);

export const uploadCmd = new Command("upload")
    .description("Upload your NEARAI TypeScript agent to NEAR AI's registry")
    .argument("[agentPath]", "Path to the agent directory (defaults to current directory).")
    .action(async (rawAgentPath: string | undefined) => {
        let finalAgentPath = rawAgentPath || "";
        if (!finalAgentPath) {
            const response = await prompts({
                type: "text",
                name: "value",
                message: "Enter the path to your agent's directory:",
                initial: "./packages/cli/dist/template",
            });
            finalAgentPath = response.value;
        }

        Logger.info(`Preparing to upload agent in: ${finalAgentPath}`);

        const metadataPath = path.join(finalAgentPath, "metadata.json");
        let metadata: any;
        try {
            const raw = await fs.readFile(metadataPath, "utf-8");
            metadata = JSON.parse(raw);
        } catch (err) {
            Logger.error(`Unable to read metadata.json at ${metadataPath}`);
            process.exit(1);
        }

        if (!metadata.name || !metadata.version) {
            Logger.error("metadata.json must include 'name' and 'version'");
            process.exit(1);
        }

        const namespace = getAuthNamespace();
        if (!namespace) {
            Logger.error("No namespace found. Make sure you're logged in.");
            process.exit(1);
        }

        Boxer.box(
            "Uploading Agent",
            chalk.hex(NEARAI_COLORS["teal"]).bold("Ready to upload your agent to NEAR AI?\n") +
            `Agent Name:    ${chalk.hex(NEARAI_COLORS["default"])(metadata.name)}\n` +
            `Description:   ${chalk.hex(NEARAI_COLORS["default"])(metadata.description || "No description")}\n\n` +
            chalk.hex(NEARAI_COLORS["teal"])("This will upload your agent to NEAR AI's public registry."),
            "blue"
        );

        const proceed = await promptYesNo("Would you like to proceed with the upload?");
        if (!proceed) {
            Logger.warn("Upload canceled by user.");
            return;
        }
        const spinner = startSpinner("Uploading to NEAR AI...");

        try {
            const entryLocation = {
                namespace,
                name: metadata.name,
                version: metadata.version,
            };

            const { name, version, ...entryMetadata } = metadata;
            await registry.updateMetadata(entryLocation, entryMetadata);

            // Ignore files listed in .gitignore
            const gitignorePath = path.join(finalAgentPath, ".gitignore");
            let ig = ignore();
            try {
                const ignoreExists = !!(await fs.stat(gitignorePath).catch(() => null));
                if (ignoreExists) {
                    const gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
                    ig = ig.add(gitignoreContent.split("\n"));
                }
            } catch (err) {
                Logger.warn("Could not parse .gitignore");
            }

            const allFiles = await globby(["**/*"], {
                cwd: finalAgentPath,
                dot: true,
                followSymbolicLinks: false,
            });

            const filteredFiles = allFiles.filter((relPath) => {
                if (
                    relPath === "metadata.json" ||
                    relPath.endsWith("~") ||
                    relPath.startsWith(".nearai/") ||
                    ig.ignores(relPath)
                ) {
                    return false;
                }
                return true;
            });

            for (const file of filteredFiles) {
                const filePath = path.join(finalAgentPath, file);
                const buffer = await fs.readFile(filePath);
                await registry.uploadFile(entryLocation, file, buffer);
            }

            spinner.succeed("Upload complete!");
            Logger.success(`Agent '${entryLocation.name}' successfully uploaded!`);
            Logger.info(`View it at: https://app.near.ai/agents/${namespace}/${entryLocation.name}/latest`);
        } catch (error: any) {
            spinner.fail("Upload failed!");
            Logger.error(error?.message || "Unknown error");
            process.exit(1);
        }
    });
