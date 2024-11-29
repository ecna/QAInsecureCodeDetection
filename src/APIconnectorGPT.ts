import OpenAI from "openai";

// This function sends a prompt to the GPT-4o model and returns the response.
async function chatGPTPrompt(prompt: string): Promise<string> {
    const openai = new OpenAI({
        apiKey: "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",
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
