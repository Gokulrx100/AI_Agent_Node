import { GoogleGenAI, type FunctionDeclaration } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const calculateSum = (a: number, b: number) => {
  return `Sum is ${a + b}`;
};

const calculateProduct = (a: number, b: number) => {
  return `product is ${a * b}`;
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

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: "Whats the sum of 2 and 3",
  config: {
    tools: [{ functionDeclarations: [sumFuctionCall] }],
  },
});

if (!response) {
  process.exit();
}

const functionCalls = response.functionCalls;

if (functionCalls && functionCalls.length > 0) {
  console.log(`Processing ${functionCalls.length} function calls`);

  const functionResponses = [];

  for (const call of functionCalls) {
    console.log(`Executing ${call.name} with args : `, call.args);

    let functionResult;
    switch (call.name) {
      case "sum":
        const a =
          typeof call?.args?.a === "number"
            ? call.args.a
            : Number(call?.args?.a);
        const b =
          typeof call?.args?.b === "number"
            ? call.args.b
            : Number(call?.args?.b);
        functionResult = calculateSum(a, b);
        break;
      default:
        functionResult = "Unknown function";
    }

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
      parts: [{ text: "Whats the sum of 2 and 3" }],
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
