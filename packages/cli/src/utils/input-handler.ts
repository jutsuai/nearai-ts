import prompts from "prompts";

/**
 * Continuously prompt for lines until user enters:
 *   - blank line, or
 *   - /done, or
 *   - /exit
 * Returns the multi-line text, or empty string if the user wants to exit.
 */
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
            return ""; // exit
        }

        const trimmed = line.trim();

        // Check for exit
        if (trimmed.toLowerCase() === "/exit") {
            return "";
        }

        // If blank line or user typed /done, we finalize:
        if (!trimmed || trimmed.toLowerCase() === "/done") {
            // Combine lines into a single multi-line message
            const multiLine = lines.join("\n").trim();
            return multiLine;
        }

        // Otherwise, add to lines array and keep going
        lines.push(line);
    }
}

/**
 * Example for single-choice or yes/no
 */
export async function promptYesNo(question: string): Promise<boolean> {
    const response = await prompts({
        type: "confirm",
        name: "confirm",
        message: question
    });
    return response.confirm;
}
