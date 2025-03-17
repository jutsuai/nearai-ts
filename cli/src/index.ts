/**
 * index.ts
 * Sets up Commander.js, registers commands, and parses user input.
 */

import { Command } from "commander";

// Import your commands
import { createCmd } from "./commands/create.js";
// import { runCmd } from "./commands/run";
// import { deployCmd } from "./commands/deploy";
// import { loginCmd } from "./commands/login";
// import { configCmd } from "./commands/config";
import { helpCmd } from "./commands/help.js";

export async function main(): Promise<void> {
    const program = new Command();

    // CLI metadata
    program
        .name("nearai")
        .description("NEAR AI TypeScript CLI")
        .version("0.0.1");

    // Register subcommands
    program.addCommand(createCmd);
    // program.addCommand(runCmd);
    // program.addCommand(deployCmd);
    // program.addCommand(loginCmd);
    // program.addCommand(configCmd);
    // program.addCommand(helpCmd);

    // Parse the command-line arguments
    await program.parseAsync(process.argv);
}
