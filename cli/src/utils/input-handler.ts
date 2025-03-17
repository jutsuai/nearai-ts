import prompts from "prompts";

/**
 * Ask the user for multiline text input, e.g. an agent prompt.
 */
export async function promptMultiline(question: string): Promise<string> {
    const response = await prompts({
        type: "text",
        name: "value",
        message: question,

        // @TODO - Note to self: Add validation for multiline input
        // For multiline, we can instruct them to use an editor or accept multi-line input
        // But prompts doesn't have a built-in multiline. One approach is 'editor' type:
        // type: 'editor',
        // We'll do 'text' for simplicity:
    });
    return response.value;
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
