import OpenAI from "openai";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";

class AgentEnvironment {
    private name: string;
    private model: string;

    constructor(
      name: string = "Agent",
      model: string = "llama-v3p1-70b-instruct",
      ) {
        this.name = name;
        this.model = model;
    }

    async run() {}

    async chat(userInput: any) {
      // 1) Load NEAR credentials from ~/.nearai/config.json
      const configPath = path.join(os.homedir(), ".nearai", "config.json");
      const rawConfig = fs.readFileSync(configPath, "utf-8");
      const authData = JSON.parse(rawConfig).auth;

      // 2) Build the request body (like an OpenAI-style chat)
      const requestBody = {
          model: this.model,
          messages: [
              { role: "system", content: "You are a helpful AI agent." },
              { role: "user", content: userInput }
          ]
      } as any;

      // 3) Construct the custom header for NEAR auth
      const userAuthString = JSON.stringify(authData);

      const openai = new OpenAI({
          baseURL: 'https://api.near.ai/v1',
          apiKey: userAuthString,
      })

      const response = await openai.chat.completions.create({
          model: 'llama-v3p1-70b-instruct',
          messages: requestBody.messages,
      }) as any;

      // 5) Parse the response and return the assistant's content
      const content = response.choices?.[0]?.message?.content || "[No content returned]";
      return content;
    }
}

export default AgentEnvironment;