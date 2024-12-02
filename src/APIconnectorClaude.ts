// This file is responsible for connecting to the Gemini API and sending a prompt to the Claude model 

import Anthropic from '@anthropic-ai/sdk';

var APIkey = "";

// This function sends a prompt to the Claude model and returns the response
async function chatClaudePrompt(prompt: string): Promise<string> {

    if (APIkey === "") {
        const APItoUse = await chrome.storage.sync.get(['Claude']);
        APIkey = APItoUse['Claude'];
    }

    const anthropic = new Anthropic({
        apiKey: APIkey, // defaults to process.env["ANTHROPIC_API_KEY"]
    });

    try {
        const result = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            temperature: 0,
            messages: [{ role: "user", content: prompt }],
        },
            { headers: { 'anthropic-dangerous-direct-browser-access': 'true' } },
        );


        function getFirstContentText(json: typeof result): string  {
            if (json.content && json.content.length > 0 && json.content[0].type === "text") {
              return json.content[0].text;
            }
            return ""; // Return null if no valid text is found
          }
          
          const textValue = getFirstContentText(result);
          console.log("First content text:", textValue);

        return textValue != "" ? textValue : "No response from the API.";

    } catch (error) {
        console.error("Error calling Claude API:", error);
        throw new Error("Failed to fetch response from Gemini API");
    }
}


export default chatClaudePrompt;
