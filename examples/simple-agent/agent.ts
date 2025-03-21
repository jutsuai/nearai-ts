import { env } from 'nearai-ts';

export default async function (config: AgentConfig) {
    try {
        const lastMsg = await env.fetchLastMessageContent();
        console.log("User input:", lastMessage);

        // Further agent code here
        // ...
    } catch (error) {
        console.error("Agent error:", error);
    }
}
