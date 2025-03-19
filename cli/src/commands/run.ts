// @TODO - Temporary
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import fetch from "node-fetch";
import OpenAI from "openai";


import { Command } from "commander";
import prompts from "prompts";
import { Logger } from "../utils/logger.js";
import { startSpinner } from "../utils/spinner.js";
import { promptYesNo, readMultiLineInput } from "../utils/input-handler.js";
import { Boxer } from "../utils/boxer.js";
import chalk from "chalk";
import { NEARAI_COLORS } from "../utils/colors.js";

// import { runAgent, runAgentOnePass, nearAiChatCompletion } from "../../../core/dist/runner.js";

// @TODO - Remove this after implementing actual agent runner
async function runAgentStub(agentPath: string): Promise<void> {
    // Simulate a short load
    await new Promise(resolve => setTimeout(resolve, 1500));
}

export const runCmd = new Command("run")
    .description("Run your NEARAI TypeScript agent in a multi-line interactive CLI")
    .argument("[agentPath]", "Optional path to your agent .ts file")
    .action(async (agentPath: string | undefined) => {
        Boxer.box(
            "Agent Runner",
            chalk.hex(NEARAI_COLORS["teal"]).bold("Time to run your NEAR AI agent!\n") +
            chalk.hex(NEARAI_COLORS["default"])(
                "We'll gather the agent path and configuration."
            ),
            "teal"
        );

        // Step 1: Prompt for agent path
        let finalAgentPath = agentPath || "";
        if (!finalAgentPath) {
            const response = await prompts({
                type: "text",
                name: "value",
                message: "Enter the path to your agent file:",
                initial: "../examples/simple-agent/agent.ts",
            });
            finalAgentPath = response.value;
        }

        Logger.info(`Preparing to run agent at: ${finalAgentPath}`);

        // Confirm agent run
        const confirm = await promptYesNo(
            `Do you want to run the agent located at '${finalAgentPath}'?`
        );
        if (!confirm) {
            Logger.warn("Agent run canceled by user.");
            return;
        }

        // Step 2: Simulate agent loading
        const spinner = startSpinner("Starting agent (stub)...");
        try {
            await runAgentStub(finalAgentPath);
            spinner.succeed("Agent ready!");
            Logger.success(`Agent '${finalAgentPath}' is running.\n`);

            // Step agent environment init
            // @TODO - Implement
            // const spinner = startSpinner("Initializing agent environment...");
            // try {
            //     // The runAgent function purely sets up config + environment (no UI)
            //     await runAgent(finalAgentPath);
            //     spinner.succeed("Environment ready!");
            //     Logger.success(`Agent '${finalAgentPath}' environment initialized.\n`);
            // } catch (err: any) {
            //     spinner.fail("Failed to run agent!");
            //     Logger.error(err?.message || "Unknown error");
            //     process.exit(1);
            // }

            // Step 3: Enter interactive loop
            Logger.info(
                "Type multiple lines. Enter /done (or blank line) to send message. Enter /exit to quit.\n"
            );

            while (true) {
                const userMessage = await readMultiLineInput();
                if (!userMessage) {
                    Logger.warn("Exiting interactive mode.");
                    break;
                }

                // Show spinner as agent is thinking
                const thinking = startSpinner("Agent is thinking...");
                // await new Promise(resolve => setTimeout(resolve, 1000));
                // const reply = await nearAiChatCompletion(userMessage);
                thinking.succeed("Agent responded!");

                // @TODO - Implement
                // const agentOutput = await runAgentOnePass(finalAgentPath);
                // Logger.info(
                //     chalk.hex(NEARAI_COLORS["teal"])("[Agent Output]: \n") +
                //     chalk.hex(NEARAI_COLORS["white"])(agentOutput || "[No output]")
                // );

                // Show agent response
                Logger.info(
                    chalk.hex(NEARAI_COLORS["teal"])("[Agent Output]: \n") +
                    chalk.hex(NEARAI_COLORS["white"])(reply || "[No output]")
                );
            }

            Logger.info("Session ended. Goodbye!");
        } catch (err: any) {
            spinner.fail("Failed to run agent!");
            Logger.error(err?.message || "Unknown error");
            process.exit(1);
        }
    });

// @TODO - Temporary!!! For Demo!!!
// export async function nearAiChatCompletion(userInput: string): Promise<string> {
//     // 1) Load NEAR credentials from ~/.nearai/config.json
//     const configPath = path.join(os.homedir(), ".nearai", "config.json");
//     const rawConfig = fs.readFileSync(configPath, "utf-8");
//     const authData = JSON.parse(rawConfig).auth;
//     // e.g. { account_id, signature, public_key, ... }
//
//     // 2) Build the request body (like an OpenAI-style chat)
//     //    near.ai may require different fields, so adjust if needed
//     const requestBody = {
//         model: "llama-v3p1-70b-instruct", // or another near.ai model name
//         messages: [
//             { role: "system", content: "You are a helpful AI agent." },
//             { role: "user", content: userInput }
//         ]
//     } as any;
//
//     // 3) Construct the custom header for NEAR auth
//     //    (If near.ai expects a different format, adapt here)
//     const userAuthString = JSON.stringify(authData);
//
//     const openai = new OpenAI({
//         baseURL: 'https://api.near.ai/v1',
//         apiKey: userAuthString,
//     })
//
//     const response = await openai.chat.completions.create({
//         model: 'llama-v3p1-70b-instruct',
//         messages: requestBody.messages,
//     }) as any;
//
//     // 5) Parse the response and return the assistant's content
//     //    near.ai might respond with { choices: [ { message: { content: "..."} } ] }
//     const content = response.choices?.[0]?.message?.content || "[No content returned]";
//     return content;
// }