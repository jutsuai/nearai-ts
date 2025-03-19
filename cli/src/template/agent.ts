import AgentEnvironment from "./AgentEnvironment.js";

(async () => {
    try {
        // 1) Gather user input from CLI args
        const userInput = process.argv.slice(2).join(" ");
        if (!userInput) {
            console.log("No input provided to agent. Exiting.");
            process.exit(0);
        }

        // 2) Create environment
        const agent = new AgentEnvironment("MyLocalAgent", "llama-v3p1-70b-instruct");

        // 3) Call .chat(...) in-process
        const reply = await agent.chat(userInput);

        // 4) Print the result
        console.log("Agent output:", reply);
    } catch (error) {
        console.error("Agent error:", error);
        process.exit(1);
    }
})();
