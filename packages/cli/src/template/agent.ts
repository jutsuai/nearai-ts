export default async function runAgent(config: any) {
    const env = config.env;

    try {
        const user_message = await env.fetchLastMessageContent();
        console.log("User input:", user_message);

        const reply = await env.generateCompletion([
            { role: "system", content: "You are a helpful assistant." },
            { role: "user",   content: user_message }
        ]);

        console.log("Agent output:", reply);

        if (env.getThreadId() !== "thread_local") {
            await env.addReply(reply);
        }

        return reply;
    } catch (error) {
        console.error("Agent error:", error);
    }
}