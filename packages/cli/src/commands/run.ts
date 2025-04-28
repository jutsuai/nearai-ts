import { Command } from "commander";
import prompts from "prompts";
import { Logger } from "../utils/logger.js";
import { startSpinner } from "../utils/spinner.js";
import { readMultiLineInput } from "../utils/input-handler.js";
import { Boxer } from "../utils/boxer.js";
import chalk from "chalk";
import { NEARAI_COLORS } from "../utils/colors.js";
import { runner, Agent } from "@jutsuai/nearai-ts-core";
import { globby } from "globby";
import fs from "fs";
import path from "path";

const GLOBBY_IGNORE = ["**/node_modules/**", "**/dist/**", "**/build/**"];

export const runCmd = new Command("run")
    .description("Run your NEARAI TypeScript agent in a multi-line interactive CLI")
    .argument("[target]", "Path to agent.ts/js or to a directory that contains it")
    .option("--local", "Use local dev environment (http://localhost:8081/v1)")
    .action(async (target: string, options: { local?: boolean }) => {
        Boxer.box(
            "Agent Runner",
            chalk.hex(NEARAI_COLORS["teal"]).bold("Time to run your NEAR AI agent!\n") +
            chalk.hex(NEARAI_COLORS["default"])("We’ll locate the agent file you want to run."),
            "teal"
        );
        /*──── 0. Resolve / ask for target ────*/
        let absTarget = target ? path.resolve(target) : undefined;

        if (!absTarget || !fs.existsSync(absTarget)) {
            if (!process.stdout.isTTY) {
                Logger.error(
                    `Path '${target ?? ""}' does not exist and I cannot prompt in non-interactive mode.`
                );
                process.exit(1);
            }
            absTarget = await promptForTarget(target ?? "src/agents");
        }

        let finalAgentPath: string | undefined;

        if (!fs.existsSync(absTarget)) {
            Logger.error(`Path '${target}' does not exist.`);
            process.exit(1);
        }

        // ───────────────── file given ─────────────────
        if (fs.statSync(absTarget).isFile()) {
            finalAgentPath = absTarget;
        } else {
            // ───────────────── directory given ─────────────────
            const matches = await globby("**/agent.{ts,js}", {
                cwd: absTarget,
                absolute: true,
                gitignore: true,
                ignore: GLOBBY_IGNORE,
            });

            if (matches.length === 0) {
                Logger.error(`No agent.ts or agent.js found under '${target}'.`);
                process.exit(1);
            }

            if (matches.length === 1) {
                finalAgentPath = matches[0];
                Logger.info(
                    `Found agent at ${path.relative(process.cwd(), finalAgentPath)}\n`
                );
            } else {
                // multiple matches
                if (process.stdout.isTTY) {
                    const { value } = await prompts({
                        type: "select",
                        name: "value",
                        message: "Multiple agents found. Which one do you want to run?",
                        choices: matches.map((m) => ({
                            title: path.relative(process.cwd(), m),
                            value: m,
                        })),
                    });
                    finalAgentPath = value;
                } else {
                    finalAgentPath = matches[0]; // non-TTY – pick first
                    Logger.warn(
                        `Multiple agents found. Using '${path.relative(
                            process.cwd(),
                            finalAgentPath
                        )}'. (Run in an interactive shell to choose.)`
                    );
                }
            }
        }

        // final safety check
        if (!finalAgentPath || fs.statSync(finalAgentPath).isDirectory()) {
            Logger.error("Internal error: resolved path is a directory, not a file.");
            process.exit(1);
        }

        // ───────────────── run the agent ─────────────────
        try {
            Logger.info(
                "Type multiple lines. Enter blank line to send. Enter /exit to quit.\n"
            );

            const { agentConfig, agentModule } = await callRunner(
                finalAgentPath,
                options.local
            );
            const agent = new Agent(agentConfig);
            const agentEnv = agent.getEnvironment();

            while (true) {
                const userMessage = await readMultiLineInput();
                if (!userMessage) continue;

                const thinking = startSpinner("");
                let output: string | undefined;

                if (typeof agentModule.default === "function") {
                    agentEnv.setLocalUserMessage(userMessage);
                    output = await agentModule.default(agent, agentConfig);
                }

                thinking.stop();
                Logger.bot(
                    chalk.hex(NEARAI_COLORS["yellow"])((output || "[No output]") + "\n")
                );
            }
        } catch (err: any) {
            Logger.error(err?.message || "Unknown error");
            process.exit(1);
        }
    });

async function callRunner(agentPath: string, useLocal?: boolean) {
    const savedArgv = [...process.argv];
    try {
        process.argv[2] = agentPath;
        process.argv[3] = "";
        if (useLocal) process.argv.push("--local");
        return await runner();
    } finally {
        process.argv.splice(0, process.argv.length, ...savedArgv);
    }
}

async function promptForTarget(initial = "src/agents"): Promise<string> {
    while (true) {
        const { value } = await prompts({
            type: "text",
            name: "value",
            message: "Where is your agent file (or directory)?",
            initial,
        });

        if (!value) {
            Logger.error("No path supplied. Aborting.");
            process.exit(1);
        }
        const abs = path.resolve(value);
        if (fs.existsSync(abs)) return abs;

        Logger.error(`Path '${value}' does not exist. Try again.\n`);
        // loop again
    }
}
