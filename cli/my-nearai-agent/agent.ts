import AgentEnvironment from "../../core/dist/runner.js";

(async () => {
    try {
        // Gather user input from CLI args
        const userInput = process.argv.slice(2).join(" ");
        if (!userInput) {
            console.log("No input provided to agent. Exiting.");
            process.exit(0);
        }

        // Create environment
        const agent = new AgentEnvironment("MyLocalAgent", "llama-v3p1-70b-instruct");

        // Call .chat(...) in-process
        const reply = await agent.chat(userInput);

        // We can implement whatever logic we want in our agent file that supports the nearai-sdk
        // ...

        // Print the result
        console.log("Agent output:", reply);
    } catch (error) {
        console.error("Agent error:", error);
        process.exit(1);
    }
})();
