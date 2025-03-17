import { env } from "ts-agent-runner";

(async () => {
    try {
        let user_message = await env.get_last_message_content();
        console.log("User input:", user_message);

        const messages: any = [
            {
                role: "system",
                content: "You are a very smart agent.",
            },
            {
                role: "user",
                content: user_message,
            },
        ];

        // inference
        const reply = await env.completion(
            messages,
            "llama-v3p1-70b-instruct",
            4000,
            0.5
        );
        if (env.get_thread_id() !== "thread_local") {
            await env.add_reply(reply);
        }

        console.log("Agent output:", reply);
    } catch (error) {
        console.error("Agent error:", error);
    }
})();