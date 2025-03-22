import chalk from "chalk";

export class Logger {
    static info(message: string) {
        console.log(chalk.blueBright("[ℹ]"), message);
    }

    static success(message: string) {
        console.log(chalk.green("[✓]"), message);
    }

    static warn(message: string) {
        console.warn(chalk.yellow("[⚠]"), message);
    }

    static error(message: string) {
        console.error(chalk.red("[✗]"), message);
    }
}