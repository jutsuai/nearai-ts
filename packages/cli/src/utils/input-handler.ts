import prompts from "prompts";
import { Logger } from "./logger.js";

export async function readMultiLineInput(): Promise<string> {
    let lines: string[] = [];

    while (true) {
        const { line } = await prompts({
            type: "text",
            name: "line",
            message: "›",
        });

        // If user pressed Ctrl+C or ESC, line will be undefined:
        if (line === undefined) {
            Logger.info("Session ended via Ctrl+C. Goodbye!");
            process.exit(0);
        }

        const trimmed = line.trim();

        // Check for exit
        if (trimmed.toLowerCase() === "/exit") {
            Logger.info("Session ended. Goodbye!");
            process.exit(0);
        }

        // If blank line or user typed /done, we finalize:
        if (!trimmed || trimmed.toLowerCase() === "/done") {
            const multiLine = lines.join("\n").trim();
            return multiLine;
        }

        // Otherwise, add to lines array and keep going
        lines.push(line);
    }
}

export async function promptYesNo(question: string): Promise<boolean> {
    const response = await prompts({
        type: "confirm",
        name: "confirm",
        message: question
    });
    return response.confirm;
}
