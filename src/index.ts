import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { DynamicTool } from "@langchain/core/tools";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import dotenv from "dotenv";

dotenv.config();

const calculateSum = (a: number, b: number): number => {
  return a + b;
};

const calculateProduct = (a: number, b: number): number => {
  return a * b;
};

const calculatePower = (a: number, b: number): number => {
  return Math.pow(a, b);
};

const sumTool = new DynamicTool({
  name: "sum",
  description: "Add two numbers together. Input should be two numbers separated by a comma.",
  func: async (input: string) => {
    const [a, b] = input.split(",").map(x => parseFloat(x.trim()));
    if (a == null || b == null || isNaN(a) || isNaN(b)) {
      return "Invalid input. Please provide two numbers separated by a comma.";
    }
    const result = calculateSum(a, b);
    console.log(`sum(${a}, ${b}) = ${result}`);
    return result.toString();
  },
});

const productTool = new DynamicTool({
  name: "product",
  description: "Multiply two numbers together. Input should be two numbers separated by a comma.",
  func: async (input: string) => {
    const [a, b] = input.split(",").map(x => parseFloat(x.trim()));
    if (a == null || b == null || isNaN(a) || isNaN(b)) {
      return "Invalid input. Please provide two numbers separated by a comma.";
    }
    const result = calculateProduct(a, b);
    console.log(`product(${a}, ${b}) = ${result}`);
    return result.toString();
  },
});

const powerTool = new DynamicTool({
  name: "power",
  description: "Raise the first number to the power of the second number. Input should be two numbers separated by a comma.",
  func: async (input: string) => {
    const [a, b] = input.split(",").map(x => parseFloat(x.trim()));
    if (a == null || b == null || isNaN(a) || isNaN(b)) {
      return "Invalid input. Please provide two numbers separated by a comma.";
    }
    const result = calculatePower(a, b);
    console.log(`power(${a}, ${b}) = ${result}`);
    return result.toString();
  },
});

const tools = [sumTool, productTool, powerTool];

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash-exp",
  temperature: 0,
  apiKey: process.env.GEMINI_API_KEY!,
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant that can perform mathematical calculations using the available tools."],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

const agent = await createToolCallingAgent({
  llm: model,
  tools,
  prompt,
});

const agentExecutor = new AgentExecutor({
  agent,
  tools,
  verbose: false,
});

const result = await agentExecutor.invoke({
  input: "First calculate 3 + 4, then multiply the result by 2, then raise it to the power of 2"
});

console.log("Final result:", result.output);