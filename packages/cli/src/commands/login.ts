import { Command } from "commander";
import prompts from "prompts";
import chalk from "chalk";
import { loginWithFileCredentials, loginWithPrivateKey, loginWithRemote } from "../utils/login.js";
import { Logger } from "../utils/logger.js";
import { Boxer } from "../utils/boxer.js";
import { NEARAI_COLORS } from "../utils/colors.js";

export const loginCmd = new Command("login")
    .description("Login to your NEAR AI account")
    .option("--remote", "Use remote login via browser", false)
    .option("--accountId <accountId>", "Your NEAR account ID")
    .option("--privateKey <privateKey>", "Your NEAR private key")
    .option("--authUrl <authUrl>", "Remote auth portal URL", "https://auth.near.ai")
    .action(async (options) => {
        const { remote, accountId, privateKey, authUrl } = options;

        if (remote) {
            Logger.info("Starting remote login flow...");
            await loginWithRemote(authUrl);
            return;
        }

        if (accountId && privateKey) {
            Logger.info("Logging in with accountId + privateKey...");
            await loginWithPrivateKey(accountId, privateKey);
            return;
        }

        if (accountId) {
            Logger.info("Logging in with accountId (from .near-credentials)...");
            await loginWithFileCredentials(accountId);
            return;
        }

        Boxer.box(
            "Login to NEAR AI",
            chalk.hex(NEARAI_COLORS.teal)(
                "You can log in using a NEAR account (with private key or local .near-credentials), or via the NEAR AI auth portal."
            ),
            "blue"
        );

        const response = await prompts([
            {
                type: "select",
                name: "method",
                message: "How would you like to log in?",
                choices: [
                    { title: "Remote via browser", value: "remote" },
                    { title: "Local NEAR credentials", value: "file" },
                    { title: "Manually enter accountId + privateKey", value: "manual" },
                ],
            },
        ]);

        switch (response.method) {
            case "remote":
                await loginWithRemote(authUrl);
                break;
            case "file":
                const { accountId: acctFromFile } = await prompts({
                    type: "text",
                    name: "accountId",
                    message: "Enter your NEAR account ID:",
                });
                await loginWithFileCredentials(acctFromFile);
                break;
            case "manual":
                const creds = await prompts([
                    {
                        type: "text",
                        name: "accountId",
                        message: "Enter your NEAR account ID:",
                    },
                    {
                        type: "password",
                        name: "privateKey",
                        message: "Enter your NEAR private key:",
                    },
                ]);
                await loginWithPrivateKey(creds.accountId, creds.privateKey);
                break;
            default:
                Logger.warn("Login cancelled.");
        }
    });
