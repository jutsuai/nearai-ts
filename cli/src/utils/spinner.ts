import ora, { Ora } from "ora";

export function startSpinner(text: string): Ora {
    const spinner = ora({
        text,
        spinner: "dots"
    }).start();

    return spinner;
}
