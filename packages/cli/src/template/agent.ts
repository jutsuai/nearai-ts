import { Agent, AgentConfig } from '@jutsuai/nearai-ts-core';

export default async function myAgent(agent: Agent, agentConfig: AgentConfig) {
    try {
        // Get user message
        const userMessage = await agent.messages().lastUser();
        console.log("User input:", userMessage);

        // Build chain of messages
        const reply = await agent
            .system("You are a helpful assistant.")
            .user(userMessage)
            .run({ model: "llama-v3p1-70b-instruct" });

        console.log("Agent output:", reply);
        return reply;
    } catch (err) {
        console.error("Agent error:", err);
        throw err;
    }
}