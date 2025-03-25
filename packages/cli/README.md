# nearai-ts-cli

This is the official NEAR AI TypeScript CLI project. It is a command-line tool that allows you to create, run, and upload NEAR AI agents written in TypeScript.

## Quick Start Guide

### 1. Install `nearai-ts` globally

```bash
npm install -g @jutsuai/nearai-ts-cli
```

### 2. Authenticate with NEAR AI

```bash
nearai-ts login
```
> ⚠️ **Note:** You only need to do this once. If you have already authenticated before you can skip this step.

### 3. Create a new project:

```bash
nearai-ts create <project-name>
```

### 4. Run the project:

```bash
cd <project-name>
nearai-ts run <project-name>
```

### 5. Upload (deploy) the project:

```bash
nearai-ts upload <project-name>
```

