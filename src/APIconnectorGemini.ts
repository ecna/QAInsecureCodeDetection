// Description: This file contains the API connector for the Gemini model.

import { GoogleGenerativeAI } from "@google/generative-ai";

//const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const genAI = new GoogleGenerativeAI("AIzaSyB5B0qNdGbjZUztc4BurhFNF7-DDJ26dfc");

const geminiConfig = {
    temperature: 0,
    topP: 0.95,
    maxOutputTokens: 1000, //correspond to roughly 600-800 words.
  };

const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro", ...geminiConfig });


async function chatGeminiPrompt(prompt: string): Promise<string> {

    try {
        const result = await model.generateContent(prompt);

        console.log(result.response.text());
        
        return result.response.text();

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to fetch response from Gemini API");
    }
}

export default chatGeminiPrompt;
