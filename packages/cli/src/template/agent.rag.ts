import { Agent, AgentConfig } from '@jutsuai/nearai-ts-core';

export default async function myRagAgent(agent: Agent, agentConfig: AgentConfig) {
    let vectorStoreId: any = "myVectorStore";

    // Attempt to find an existing store named "myVectorStore"
    let vectorStore = await agent.vectors().find(vectorStoreId);

    // Create vector store with a dummy file if it doesn't exist
    if (!vectorStore) {
        const dummyContent = "I stand before you with unwavering faith in the collective power of humanity, for within each heart lies the spark of compassion that ignites the flame of progress. This is not the hour to resign ourselves to despair, nor the moment to settle for half-measures. Rather, we must rise together, guided by the light of truth and the firm conviction that our bond transcends the boundaries of color, creed, or station. In the face of adversity, we must remain resolute, carrying forward the promise of justice that beckons us from the horizon of tomorrow. Let our words not merely echo in the halls of distant hope, but ring out in the streets and fields of our communities, inspiring action and building bridges of solidarity. When fear threatens to divide, let us recall that courage and unity can dismantle even the mightiest walls. Today, and every day, we choose the path of empathy over the quick profit of indifference, knowing that the fruits of our shared struggles ripen only in the sun of perseverance. By forging a future rooted in dignity and respect for all, we honor the dreams of those who stood before us and empower the generations that will follow. Lift your eyes to the dawn of possibility, take up the banner of integrity, and press on with unwavering determination. In our collective hands rests the power to shape a society that uplifts, enlightens, and forever testifies to the triumph of hope. We rise, linked by courage and conscience.";
        const uploadedFile = await agent.files().upload(
            dummyContent,
            'assistants',
        );

        // Create a new vector store with the uploaded file
        vectorStore = await agent.vectors().create(
            'myVectorStore',
            [uploadedFile.id],
        );
    }
    vectorStoreId = vectorStore.id;

    // Query the vector store with the users message
    const userMessage = await agent.messages().lastUser() || "No user message found.";
    const results = await agent.vectors().query(vectorStoreId as string, userMessage, true);
    const context = results.map((r: any) => r.file_content).join('\n');

    // Provide the retrieved context + user message to the model
    return await agent
        .system(`You are a helpful RAG assistant. Below is context from our knowledge base:\n${context}`)
        .user(userMessage)
        .run({ model: "llama-v3p1-70b-instruct" });
}
