import { Command } from "commander";
import { loadBanner } from "./utils/banner.js";
import { createCmd } from "./commands/create.js";
import { runCmd } from "./commands/run.js";
import { uploadCmd } from "./commands/upload.js";
// import { loginCmd } from "./commands/login.js";
// import { configCmd } from "./commands/config.js";
import { helpCmd } from "./commands/help.js";

export async function main(): Promise<void> {
    const program = new Command();

    // Load the banner
    loadBanner();

    // CLI metadata
    program
        .name("nearai")
        .description("NEAR AI TypeScript CLI")
        .version("0.0.1");

    // Register subcommands
    program.addCommand(createCmd);
    program.addCommand(runCmd);
    program.addCommand(uploadCmd);
    // program.addCommand(loginCmd);
    // program.addCommand(configCmd);
    program.addCommand(helpCmd);

    // Parse the command-line arguments
    await program.parseAsync(process.argv);
}
