#!/usr/bin/env node

/**
 * nearai.ts
 * This file is the TypeScript CLI entrypoint.
 */

import { main } from "../index.js";

async function run() {
    try {
        await main();
    } catch (error) {
        console.error("CLI encountered an error:", error);
        process.exit(1);
    }
}

run();
