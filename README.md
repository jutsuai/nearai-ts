# nearai-ts
The typescript implementation of NEAR AI Agent Platform.

## Directory Structure Overview

### 📁 cli/ (@jutsu/nearai-ts/cli)

Handles CLI execution, command parsing, and interactive agent running.

```
cli/
│── src/
│   │── commands/               # CLI Commands
│   │   ├── create.ts           # nearai create <agent>
│   │   ├── run.ts              # nearai run <agent>
│   │   ├── deploy.ts           # nearai deploy <agent>
│   │   ├── login.ts            # nearai login
│   │   ├── help.ts             # nearai --help
│   │   ├── config.ts           # nearai config
│   │── utils/                  # CLI utilities (helpers)
│   │   ├── logger.ts           # Logging helpers
│   │   ├── input-handler.ts    # Interactive input handling
│   │   ├── spinner.ts          # Loading indicators
│   │   ├── subprocess.ts       # Manages Python subprocess calls
│   │── bin/                    # CLI Entrypoint
│   │   ├── nearai.ts           # Executable CLI script
│   │── index.ts                # CLI initialization logic
│── tests/                      # CLI tests
│── package.json                # CLI package metadata
│── tsconfig.json               # TypeScript config
│── README.md                   # CLI usage guide
```

### 📁 core/ (@jutsu/nearai-ts/core)

Handles agent execution, configuration management, and environment handling.

```
core/
│── src/
│   │── agent/                    # Core agent logic
│   │   ├── agent.ts              # Main agent execution logic
│   │   ├── agent-loader.ts       # Loads agents dynamically
│   │   ├── memory.ts             # Memory management
│   │   ├── tools.ts              # Plugin/Tool system
│   │── execution/                # Agent execution logic
│   │   ├── runner.ts             # Agent execution controller
│   │   ├── process-handler.ts    # Handles agent subprocesses
│   │   ├── sandbox.ts            # Sandboxed execution (future-proofing)
│   │── environment/              # Execution Environment Handling
│   │   ├── global-env.ts         # Global execution context
│   │   ├── agent-env.ts          # Per-agent environment settings
│   │── clients/                  # API Clients (Secure Communication)
│   │   ├── near-client.ts        # NEAR blockchain integration
│   │   ├── secure-client.ts      # Handles secure API requests
│   │   ├── openai-client.ts      # OpenAI LLM interactions
│   │── config/                   # Configuration System
│   │   ├── config-manager.ts     # Reads & validates configuration
│   │   ├── config-types.ts       # Type definitions for configuration
│   │── index.ts                  # Core SDK entry point
│── tests/                        # Core SDK test suite
│── package.json                  # Core SDK metadata
│── tsconfig.json                 # TypeScript config
│── README.md                     # SDK documentation
```

### 📁 examples/ (@jutsu/nearai-ts/examples)

Example projects demonstrating how to use the SDK (core) and CLI.

```
examples/
│── simple-agent/                 # Minimal working agent example
│   ├── agent.ts
│   ├── package.json
│   ├── README.md
│── advanced-agent/               # Complex multi-tool agent
│   ├── agent.ts
│   ├── tools/
│   ├── package.json
│   ├── README.md
│── near-integrated-agent/        # Example using NEAR blockchain
│   ├── agent.ts
│   ├── package.json
│   ├── README.md
```

