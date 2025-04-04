import { Command } from "commander";
import path from "path";
import fs from "fs/promises";
import os from "os";
import chalk from "chalk";
import prompts from "prompts";
import { globby } from "globby";
import ignore from "ignore";

import { Logger } from "../utils/logger.js";
import { startSpinner } from "../utils/spinner.js";
import { promptYesNo } from "../utils/input-handler.js";
import { Boxer } from "../utils/boxer.js";
import { NEARAI_COLORS } from "../utils/colors.js";
import Registry from "../utils/registry.js";
import { getAuthNamespace } from "../utils/auth.js";

export const uploadCmd = new Command("upload")
    .description("Upload your NEARAI TypeScript agent to NEAR AI's registry")
    .argument("[agentPath]", "Path to the agent directory (defaults to current directory).")
    .option("--bump", "Auto-increment patch version if it already exists")
    .option("--minor-bump", "Auto-increment minor version")
    .option("--major-bump", "Auto-increment major version")
    .option("--local", "Copy the agent locally instead of uploading to NEAR AI")
    .action(async (rawAgentPath: string | undefined, opts: {
        local?: boolean,
        bump?: boolean,
        minorBump?: boolean,
        majorBump?: boolean,
    }) => {
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
        finalAgentPath = path.resolve(process.cwd(), finalAgentPath);

        Logger.info(`Preparing to ${opts.local ? "copy locally" : "upload"} agent in: ${finalAgentPath}`);

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

        let namespace: string = getAuthNamespace() as any;
        if (opts.local) {
            const response = await prompts({
                type: "text",
                name: "value",
                message: "Enter a namespace to use for local copy:",
                initial: `${namespace}`,
                validate: (val: string) => val.trim().length > 0 ? true : "Namespace cannot be empty",
            });
            namespace = response.value.trim();
        } else {
            if (!namespace) {
                Logger.error("No namespace found. Make sure you're logged in.");
                process.exit(1);
            }
        }

        Boxer.box(
            opts.local ? "Local Agent Copy" : "Uploading Agent",
            chalk.hex(NEARAI_COLORS["teal"]).bold(
                `Ready to ${opts.local ? "copy your agent locally" : "upload your agent to NEAR AI"}?\n`
            ) +
            `Agent Name:    ${chalk.hex(NEARAI_COLORS["default"])(metadata.name)}\n` +
            `Description:   ${chalk.hex(NEARAI_COLORS["default"])(metadata.description || "No description")}\n\n` +
            chalk.hex(NEARAI_COLORS["teal"])(
                opts.local
                    ? "This will copy your agent to the local registry at ~/.nearai/registry."
                    : "This will upload your agent to NEAR AI's public registry."
            ),
            "blue"
        );

        // Confirm upload
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
            const registry = new Registry({ local: opts.local });

            // Check if the agent already exists and if a bump is requested
            // const versionAlreadyExists = await registry.versionExists(namespace, metadata.name, metadata.version);
            // const bumpRequested = opts.bump || opts.minorBump || opts.majorBump;
            //
            // if (versionAlreadyExists && bumpRequested) {
            //     const oldVersion = metadata.version;
            //     const bumpType = opts.majorBump ? "major" : opts.minorBump ? "minor" : "patch";
            //     metadata.version = registry.bumpVersion(oldVersion, bumpType);
            //
            //     Logger.info(`Bumped version: ${oldVersion} → ${metadata.version}`);
            //     await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");
            // } else if (versionAlreadyExists && !bumpRequested) {
            //     Logger.error(`Version ${metadata.version} already exists. Use --bump/--minor-bump/--major-bump`);
            //     process.exit(1);
            // }

            // Update metadata
            const { name, version, ...entryMetadata } = metadata;
            // await registry.updateMetadata(entryLocation, entryMetadata);
            //
            // // Ignore files listed in .gitignore
            // const gitignorePath = path.join(finalAgentPath, ".gitignore");
            // let ig = ignore();
            // try {
            //     const ignoreExists = !!(await fs.stat(gitignorePath).catch(() => null));
            //     if (ignoreExists) {
            //         const gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
            //         ig = ig.add(gitignoreContent.split("\n"));
            //     }
            // } catch (err) {
            //     Logger.warn("Could not parse .gitignore");
            // }
            //
            // const allFiles = await globby(["**/*"], {
            //     cwd: finalAgentPath,
            //     dot: true,
            //     followSymbolicLinks: false,
            // });
            //
            // const filteredFiles = allFiles.filter((relPath) => {
            //     if (
            //         relPath === "metadata.json" ||
            //         relPath.endsWith("~") ||
            //         relPath.startsWith(".nearai/") ||
            //         ig.ignores(relPath)
            //     ) {
            //         return false;
            //     }
            //     return true;
            // });

            if (opts.local) {
                // const destPath = path.join(os.homedir(), ".nearai", "registry", namespace, metadata.name, metadata.version);
                //
                // for (const relPath of filteredFiles) {
                //     const src = path.join(finalAgentPath, relPath);
                //     const dest = path.join(destPath, relPath);
                //     await fs.mkdir(path.dirname(dest), { recursive: true });
                //     await fs.writeFile(dest, await fs.readFile(src));
                // }
                // const metaDest = path.join(destPath, "metadata.json");
                // await fs.mkdir(path.dirname(metaDest), { recursive: true });
                // await fs.copyFile(metadataPath, metaDest);

                spinner.succeed("Local copy complete!");
                Logger.success(`Agent '${metadata.name}' copied locally under namespace '${namespace}'`);
                // Logger.info(`Path: ${path.relative(process.cwd(), path.join(destPath))}`);
            } else {
                // const entryLocation = {
                //     namespace,
                //     name: metadata.name,
                //     version: metadata.version,
                // };
                //
                // const { name, version, ...entryMetadata } = metadata;
                // await registry.updateMetadata(entryLocation, entryMetadata);
                //
                // for (const file of filteredFiles) {
                //     const filePath = path.join(finalAgentPath, file);
                //     const buffer = await fs.readFile(filePath);
                //     await registry.uploadFile(entryLocation, file, buffer);
                // }

                spinner.succeed("Upload complete!");
                Logger.success(`Agent '${entryLocation.name}' successfully uploaded!`);
                Logger.info(`View it at: https://app.near.ai/agents/${namespace}/${entryLocation.name}/latest`);
            }
        } catch (error: any) {
            spinner.fail("Upload failed!");
            Logger.error(error?.message || "Unknown error");
            process.exit(1);
        }
    });
