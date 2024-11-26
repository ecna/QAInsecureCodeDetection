// This file is responsible for connecting to the Gemini API and sending a prompt to the Claude model 

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: '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', // defaults to process.env["ANTHROPIC_API_KEY"]
});



async function chatClaudePrompt(prompt: string): Promise<string> {

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
