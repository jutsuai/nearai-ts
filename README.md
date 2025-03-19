# nearai-ts
The typescript implementation of NEAR AI Agent Platform.

## Directory Structure Overview

### 📁 cli/ (@jutsu/nearai-ts/cli)

Handles CLI execution, command parsing, and interactive agent running.

```
cli/
│── src/
│   │── bin/                    # CLI Entrypoint
│   │   ├── nearai.ts           # Executable CLI script
│   │── commands/               # CLI Commands
│   │   ├── create.ts           # nearai create <agent>
│   │   ├── run.ts              # nearai run <agent>
│   │   ├── deploy.ts           # nearai deploy <agent>
│   │   ├── login.ts            # nearai login
│   │   ├── help.ts             # nearai --help
│   │   ├── config.ts           # nearai config
│   │── template/               # Agent template files
│   │   ├── agent.ts            # Default agent template
│   │   ├── metadata.json       # Default agent configuration
│   │── utils/                  # CLI utilities (helpers)
│   │   ├── banner.ts           # CLI banner
│   │   ├── boxer.ts            # Boxed text
│   │   ├── colors.ts           # CLI color helpers
│   │   ├── logger.ts           # Logging helpers
│   │   ├── input-handler.ts    # Interactive input handling
│   │   ├── spinner.ts          # Loading indicators
│   │── index.ts                # CLI initialization logic
│── dist/                       # Compiled CLI output
│── tests/                      # CLI tests
│── package.json                # CLI package metadata
├── tsconfig.json               # TS config, outputs .js to dist/
│── tsconfig.json               # TypeScript config
│── README.md                   # CLI usage guide
```

### 📁 core/ (@jutsu/nearai-ts/core)

Handles agent execution, configuration management, and environment handling.

```
core/
│── src/
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

