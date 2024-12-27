// Description: This file contains the API connector for the Gemini model.

import { GoogleGenerativeAI } from "@google/generative-ai";

var APIkey = "";

const schema = `
{
  "type": "object",
  "properties": {
    "isCodeSecure": {
      "type": "boolean"
    },
    "CWEs": {
      "type": "array",
      "items": {
        "type": "integer"
      }
    }
  },
  "required": ["isCodeSecure", "CWEs"]
}
`;

// This function sends a prompt to the Gemini model and returns the response
async function chatGeminiPrompt(prompt: string): Promise<string> {

    if (APIkey === "") {
        const APItoUse = await chrome.storage.sync.get(['Gemini']);
        APIkey = APItoUse['Gemini'];
    }

    //const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const genAI = new GoogleGenerativeAI(APIkey);

    const geminiConfig = {
        temperature: 0,
        // system: "Don't give an explanation and only answer with JSON object and without new line characters (\n). So no extra prefixes or suffixes to the JSON data (RAW JSON data only!).",
        topP: 0.95,
        responseSchema: schema,
        maxOutputTokens: 50, //correspond to roughly 600-800 words.
    };

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", ...geminiConfig });

    try {
        const result = await model.generateContent(prompt);

        console.log(result.response.text());

        return result.response.text();

    } catch (error) {

        console.error("Error calling Gemini API:", error);
        // Retry the API call once if an error occurs
        try {
            const retryResult = await model.generateContent(prompt);

            console.log(retryResult.response.text());

            return retryResult.response.text();

        } catch (retryError) {
            console.error("Retry failed:", retryError);
            return JSON.stringify({});
        }
    }
}

export default chatGeminiPrompt;
