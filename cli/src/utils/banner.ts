import chalk from "chalk";
import { NEARAI_COLORS } from "./colors.js";

export const NEARAI_BANNER = `
    ::::    :::  ::::::::::      :::      :::::::::            :::      :::::::::::
    :+:+:   :+:  :+:           :+: :+:    :+:    :+:         :+: :+:        :+:
    :+:+:+  +:+  +:+          +:+   +:+   +:+    +:+        +:+   +:+       +:+
    +#+ +:+ +#+  +#++:++#    +#++:++#++:  +#++:++#:        +#++:++#++:      +#+
    +#+  +#+#+#  +#+         +#+     +#+  +#+    +#+       +#+     +#+      +#+
    #+#   #+#+#  #+#         #+#     #+#  #+#    #+#       #+#     #+#      #+#
    ###    ####  ##########  ###     ###  ###    ###       ###     ###  ###########
`;

export const loadBanner = () => {
    console.log(chalk.hex(NEARAI_COLORS.green)(NEARAI_BANNER));
}