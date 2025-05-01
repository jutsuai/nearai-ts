import { Agent, AgentConfig } from '@jutsuai/nearai-ts-core';
import { promises as fs } from "node:fs";

export default async function myImageAgent(agent: Agent, config: AgentConfig) {
    const userPrompt = await agent.messages().lastUser() || "No user message found.";

    // Generate image with user prompt
    const [img] = await agent.images().generate(userPrompt);
    const payload = img.startsWith('data:image') ? img.split(',')[1] : img;
    await fs.writeFile('/tmp/generated.png', payload, 'base64');
    console.log('saved → /tmp/generated.png');
}