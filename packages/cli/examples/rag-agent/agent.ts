import { Agent, AgentConfig } from '@jutsuai/nearai-ts-core';

const STORE_ID = "myVectorStore";

export default async function myDocRAGAgent(agent: Agent, agentConfig: AgentConfig) {
    const userMessage = await agent.messages().lastUser() || "No user message found.";

    // Attempt to find an existing store named "myVectorStore", otherwise create it
    let vectorStore = await agent.vectors().find(STORE_ID).catch(() => null);
    if (!vectorStore) {
        const { id: fileId } = await agent.files().upload(
            "I stand before you with unwavering faith in the collective power of humanity…",
            "assistants",
        );

        vectorStore = await agent.vectors().create(STORE_ID, [fileId]);
    }

    const results = await agent.vectors().query(vectorStore.id, userMessage, true);
    const context = results.map((r: any) => r.file_content).join('\n');

    // Provide the retrieved context + user message to the model
    return await agent
        .system(`You are a helpful RAG assistant. Below is context from our knowledge base:\n${context}`)
        .user(userMessage)
        .run({ model: "llama-v3p1-70b-instruct" });
}
