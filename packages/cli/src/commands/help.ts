import { Command } from "commander";
import { Logger } from "../utils/logger.js";
import chalk from "chalk";
import { Boxer } from "../utils/boxer.js";
import { NEARAI_COLORS } from "../utils/colors.js";

export const helpCmd = new Command("help")
    .description("Displays help information about the NEAR AI CLI")
    .action(() => {
            Boxer.box(
                "NEAR AI CLI Help",
                chalk.hex(NEARAI_COLORS["teal"]).bold("Command Reference for NEAR AI CLI\n") +
                chalk.hex(NEARAI_COLORS["default"])("Here's what you can do with the CLI:"),
                "teal"
            );

            const commands = [
                    {
                            cmd: "nearai-ts create <projectName>",
                            desc: "Create a new agent project"
                    },
                    {
                            cmd: "nearai-ts run [agentPath]",
                            desc: "Run your agent locally in interactive mode"
                    },
                    {
                            cmd: "nearai-ts upload",
                            desc: "Upload (deploy) an agent to NEAR AI"
                    },
                    {
                            cmd: "nearai-ts login",
                            desc: "Authenticate your NEAR AI account"
                    }
            ];

            commands.forEach(({ cmd, desc }) => {
                    Logger.info(`${chalk.bold(cmd)}`);
                    console.log(chalk.hex(NEARAI_COLORS["default"])(`  ${desc}\n`));
            });
    });
