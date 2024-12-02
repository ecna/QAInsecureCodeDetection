import OpenAI from "openai";

var APIkey  = "";

// This function sends a prompt to the GPT-4o model and returns the response.
async function chatGPTPrompt(prompt: string): Promise<string> {
    
    if (APIkey === "") {
        const APItoUse = await chrome.storage.sync.get(['GPT']);
        APIkey = APItoUse['GPT'];
    }

    const openai = new OpenAI({
        apiKey: APIkey,
    });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o", 
            messages: [{ role: "user", content: prompt }],
            temperature: 0, // Ensures deterministic and precise responses
        });

        return response.choices[0]?.message.content ?? "No response from the API.";
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        throw new Error("Failed to fetch response from OpenAI API");
    }
}

export default chatGPTPrompt;
