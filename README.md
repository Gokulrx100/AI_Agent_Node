<h1 align="center">AI Agent Node: Langchain Gemini Tool Calling</h1>

## Overview

This project demonstrates an interactive AI agent built with Langchain and Google Gemini, capable of performing mathematical operations using tool/function calling. The agent can:

- Parse natural language instructions
- Call custom tools (sum, product, power)
- Chain tool outputs for multi-step reasoning

## Features

- **Langchain Agent**: Orchestrates tool calls and manages conversation flow
- **Google Gemini LLM**: Handles natural language understanding and tool invocation
- **Custom Tools**: Sum, Product, Power (all defined in TypeScript)
- **Interactive Prompt**: Accepts complex instructions and returns computed results

## Project Structure

```
├── src/
│   └── index.ts         # Main agent logic and tool definitions
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── README.md            # Project documentation
```

## Tool Schema

Each tool is defined using Langchain's `DynamicTool`:

```typescript
const sumTool = new DynamicTool({
	name: "sum",
	description: "Add two numbers together. Input: 'a, b'",
	func: async (input: string) => { /* ... */ },
});
```

**All tools expect input as a comma-separated string of two numbers.**

| Tool    | Description                                 | Example Input | Example Output |
|---------|---------------------------------------------|--------------|---------------|
| sum     | Adds two numbers                            | 3, 4         | 7             |
| product | Multiplies two numbers                      | 2, 5         | 10            |
| power   | Raises first number to power of second      | 2, 3         | 8             |

## Agent Flow

1. User provides a natural language instruction (e.g., "First calculate 3 + 4, then multiply the result by 2, then raise it to the power of 2").
2. Gemini parses the instruction and determines which tools to call and in what order.
3. The agent executes each tool, passing results as needed.
4. The final result is returned to the user.

## Usage Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

Create a `.env` file in the project root:

```
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Run the Agent

```bash
npm run dev
```

### 4. Example Interaction

```
Processing 1 function calls
Executing sum with args :  { a: 3, b: 4 }
function sum(3, 4) = 7
Final result: 196
```

## Customization

- Add more tools by defining new `DynamicTool` instances in `src/index.ts`.
- Change the prompt template for different agent behaviors.

## Advanced: Langchain Agent Schema

The agent uses the following schema:

- **Tools**: Array of `DynamicTool` objects
- **Prompt**: `ChatPromptTemplate` with placeholders for chat history and agent scratchpad
- **Agent**: Created via `createToolCallingAgent`
- **Executor**: Handles invocation and chaining

## References

- [Langchain Documentation](https://js.langchain.com/docs/)
- [Google Gemini API](https://ai.google.dev/)

---
