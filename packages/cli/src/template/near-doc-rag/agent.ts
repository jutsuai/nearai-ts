import { Agent, AgentConfig } from '@jutsuai/nearai-ts-core';
import { promises as fs } from "node:fs";

const STORE_ID = "myNearDocsVectorStore";
const FILE_NAME = "near_docs_1.md"
const DOC_PATH   = "./src/template/near-doc-rag/docs.md";

export default async function myDocRAGAgent(agent: Agent, config: AgentConfig) {
    const userQuery = await agent.messages().lastUser() || "No user message found.";

    // @TODO - Temp test of loaded environment vars
    console.log("env vars:", config.envVars);


    // // Search for existing store and add docs file
    // let store = await agent.vectors().find(STORE_ID).catch(() => null);
    // if (!store) {
    //     const markdown = await fs.readFile(DOC_PATH, "utf8");
    //     const { id: fileId } = await agent
    //         .files()
    //         .upload(markdown, "assistants", "utf‑8", FILE_NAME);
    //
    //     store = await agent.vectors().create(STORE_ID, [fileId]);
    // }
    //
    // // Search and retrieve results from vector store
    // const vectorResults = await agent.vectors().query(store.id, userQuery, false);
    // const context = vectorResults.map((h: any) => h.chunk_text).join("\n");
    //
    // // Provide the retrieved context + user message to the model
    // return await agent
    //     .system(`You are a helpful RAG assistant.`)
    //     .assistant(`Below is documentation context from our knowledge base:\n${context}`)
    //     .user(userQuery)
    //     .run({ model: "llama-v3p1-70b-instruct" });
}
