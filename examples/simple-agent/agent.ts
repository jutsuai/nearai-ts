import { env } from 'ts-agent-runner';

export default async function (config: AgentConfig) {
    try {
        const lastMsg = await env.fetchLastMessageContent();
        console.log("User input:", lastMessage);

        // const messages = [
        //     { role: "system", content: "You are a smart assistant." },
        //     { role: "user",   content: userMessage },
        // ];
        //
        // const reply = await someSDKOrEnv.completion(messages, /* model */ "llama-v3p1-70b-instruct");
        // if (config.threadId !== "thread_local") {
        //     await someSDKOrEnv.addReply(reply);
        // }
        //
        // console.log("Agent output:", reply);
    } catch (error) {
        console.error("Agent error:", error);
    }
}
