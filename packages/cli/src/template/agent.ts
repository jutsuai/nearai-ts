import { env, AgentConfig } from "@jutsuai/nearai-ts-core";

export default async function runAgent(config: AgentConfig) {
    try {
        const lastMsg = await env().fetchLastMessageContent() || "";
        if (!lastMsg.trim()) {
            console.log("No user message provided; nothing to process.");
            return;
        }

        const reply = await env().generateCompletion([
            { role: "system", content: "You are a helpful assistant." },
            { role: "user",   content: lastMsg }
        ]);

        return reply;
    } catch (error) {
        console.error("Agent error:", error);
    }
}
