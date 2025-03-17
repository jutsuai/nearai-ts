import chalk from 'chalk'

export const logger = {
    success: (message: string) => console.log(chalk.green(`✓ ${message}`)),
    info: (message: string) => console.log(chalk.blue(`ℹ ${message}`)),
    warn: (message: string) => console.log(chalk.yellow(`⚠ ${message}`)),
    error: (message: string) => console.log(chalk.red(`✗ ${message}`)),
}