import chalk from "chalk";
import boxen from "boxen";
import { NEARAI_COLORS } from "./colors.js";

export class Boxer {

    /**
     * Prints a headline in the chosen color,
     * then prints a box with matching border color and text color.
     *
     * @param headline   The title you want above the box
     * @param content    The main text inside the box
     * @param color      One of 'teal', 'blue', or 'default' (hex is #6F6F72)
     */
    static box(headline: string, content: string, color: keyof typeof NEARAI_COLORS = "default"): void {
        // Fallback to "default" if user passes an invalid color key
        const colorHex = NEARAI_COLORS[color] ?? NEARAI_COLORS.default;

        // Colorize the content as well
        const styledContent = chalk.hex(colorHex)(content);

        // Create the box
        const box = boxen(styledContent, {
            padding: .5,
            margin: .5,
            title: chalk.hex(colorHex)(headline),
            titleAlignment: "center",
            borderStyle: "round",
            borderColor: colorHex,
            width: (process.stdout.columns || 80) - 2,
        });

        // Print the box
        console.log(box);
    }
}