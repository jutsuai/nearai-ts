import Agent from "nearai-ts";

(async () => {
    try {
        const agent = new Agent({
            name: "Agent",
            model: "llama-v3p1-70b-instruct",
        });

        const reply = await agent.chat("Hello, how can I help you today?");

        console.log("Agent output:", reply);
    } catch (error) {
        console.error("Agent error:", error);
    }
})();