import { Command } from "commander";

/**
 * nearai help
 * A custom help command (though Commander normally handles --help).
 */
export const helpCmd = new Command("help")
    .description("Displays help information about the NEAR AI CLI")
    .action(() => {
        console.log("NEAR AI CLI Help:");
        console.log("  nearai create <projectName>  - Create a new TS project");
        console.log("  nearai run [agentPath]       - Run a TypeScript agent");
        console.log("  nearai deploy                - Deploy an agent to NEAR AI");
        console.log("  nearai login                 - Authenticate your NEAR account");
        console.log("  nearai config                - Manage local CLI config");
        console.log();
        console.log("You can also use --help on any command for more details, e.g.:");
        console.log("  nearai create --help");
    });
