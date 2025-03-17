import { Command } from "commander";

/**
 * nearai create <projectName>
 * Example usage:
 *   nearai create MyProject
 */
export const createCmd = new Command("create")
    .description("Create a new NEAR AI TypeScript project")
    .argument("<projectName>", "Name of the project to create")
    .action((projectName: string) => {
        console.log(`Creating a new NEAR AI TS project: ${projectName}`);

        // @TODO
        // Here’s where you'd scaffold the project, copy templates, etc.
        // For example:
        // scaffoldProject(projectName);
    });
