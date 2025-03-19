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


// @TODO - Scrap Notes Zahid Conversation
// nearai-ts create hello-agent
// nearai-ts run hello-agent
//
//
//
// hello-agent
// - build
// - agents
// - agent.ts
// - config.json
// - .env
// - package.json
//
//
//
//
// agent.ts
//
//
// import { agent } from "nearai/core";
//
// const myAgent = Agent({
//     prompt: "hello",
//     model: "jfaskdjkfads"
// });
//
//
//
// myAgent.run();
//
//
// core.ts
//
// class Agent {
//
//
//
//
//     run() {
//
//         const openai = new OpenAI({
//             base_url: "",
//             api_key = JSON.stringify(credential)
//         })
//
//         const res = openai.chat.compt
