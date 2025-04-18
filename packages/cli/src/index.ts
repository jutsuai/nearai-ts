import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { loadBanner } from "./utils/banner.js";
import { createCmd } from "./commands/create.js";
import { runCmd } from "./commands/run.js";
import { uploadCmd } from "./commands/upload.js";
import { loginCmd } from "./commands/login.js";
import { helpCmd } from "./commands/help.js";

export async function main(): Promise<void> {
    const program = new Command();

    // Load the banner
    loadBanner();

    // Load package.json
    const pkg = JSON.parse(
        readFileSync(
            join(dirname(fileURLToPath(import.meta.url)), "..", "package.json"),
            "utf-8",
        ),
    );

    // CLI metadata
    program.name("nearai");
    program.description("NEAR AI TypeScript CLI");
    program.version(pkg.version);

    // Register subcommands
    program.addCommand(createCmd);
    program.addCommand(runCmd);
    program.addCommand(uploadCmd);
    program.addCommand(loginCmd);
    program.addCommand(helpCmd);

    // Parse the command-line arguments
    await program.parseAsync(process.argv);
}
