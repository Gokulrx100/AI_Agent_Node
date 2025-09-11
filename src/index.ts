import { GoogleGenAI, type FunctionDeclaration } from "@google/genai";
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

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const sumFuctionCall: FunctionDeclaration = {
  name: "sum",
  description: "This tool is used to find the sum of 2 numbers",
  parametersJsonSchema: {
    type: "object",
    properties: {
      a: {
        type: "number",
      },
      b: {
        type: "number",
      },
    },
    required: ["a", "b"],
  },
};

const productFucntionCall: FunctionDeclaration = {
  name: "product",
  description: "This tool is used to find product of two numbers",
  parametersJsonSchema: {
    type: "object",
    properties: {
      a: {
        type: "number",
      },
      b: {
        type: "number",
      },
    },
    required: ["a", "b"],
  },
};

const powerFunctionCall: FunctionDeclaration = {
  name: "power",
  description: "This tool is used to raise a number to the power of another",
  parametersJsonSchema: {
    type: "object",
    properties: {
      a: {
        type: "number",
      },
      b: {
        type: "number",
      },
    },
    required: ["a", "b"],
  },
};


const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: "First calculate 3 + 4, then multiply the result by 2, then raise it to the power of 2",
  config: {
    tools: [{ functionDeclarations: [sumFuctionCall, productFucntionCall, powerFunctionCall] }],
  },
});

if (!response) {
  process.exit();
}

const functionCalls = response.functionCalls;

if (functionCalls && functionCalls.length > 0) {
  console.log(`Processing ${functionCalls.length} function calls`);

  const functionResponses = [];
  let intermediateResult : number | null = null;

  for (const call of functionCalls) {
    console.log(`Executing ${call.name} with args : `, call.args);

    const a = intermediateResult !== null ? intermediateResult : typeof call?.args?.a === "number" ? call.args.a : Number(call?.args?.a);
    const b = typeof call?.args?.b === "number" ? call.args.b : Number(call?.args?.b);

    let functionResult : number;
    switch (call.name) {
      case "sum":
        functionResult = calculateSum(a, b);
        break;
      case  "product":
        functionResult = calculateProduct(a,b);
        break;
      case "power":
        functionResult = calculatePower(a, b);
        break;
      default:
        functionResult = NaN;
    }

    console.log(`function ${call.name}(${a}, ${b}) = ${functionResult}`);
    intermediateResult = functionResult;

    functionResponses.push({
      functionResponse: {
        name: call.name ?? "unknown",
        response: { result: functionResult },
      },
    });
  }

  const contentsArray = [
    {
      role: "user",
      parts: [{ text: "First calculate 3 + 4, then multiply the result by 2, then raise it to the power of 2" }],
    },
    ...(response.candidates && response.candidates[0]?.content
      ? [response.candidates[0].content]
      : []),
    {
      role: "user",
      parts: functionResponses,
    },
  ];

  const finalResult = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contentsArray,
  });
  console.log(
    "final result:",
    finalResult.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response text"
  );
} else {
  console.log("Direct response: ", response.text);
}
