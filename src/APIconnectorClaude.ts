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
            max_tokens: 1500,
            temperature: 0,
            // system: "Don't give an explanation and only answer with JSON object and without new line characters (\n). So no extra prefixes or suffixes to the JSON data (RAW JSON data only!).",
            messages: [{ role: "user", content: prompt },
            ],
        },
            { headers: { 'anthropic-dangerous-direct-browser-access': 'true' } },
        );


        function getFirstContentText(json: typeof result): string {
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
        // Retry the API call once if an error occurs
        
        try {
            const retryResult = await anthropic.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 1500,
                temperature: 0,
                messages: [
                    { role: "user", content: prompt }
                ],
            },
                { headers: { 'anthropic-dangerous-direct-browser-access': 'true' } },
            );

            function getFirstContentText(json: typeof retryResult): string {
                if (json.content && json.content.length > 0 && json.content[0].type === "text") {
                    return json.content[0].text;
                }
                return ""; // Return null if no valid text is found
            }

            const retryTextValue = getFirstContentText(retryResult);
            console.log("First content text after retry:", retryTextValue);

            return retryTextValue != "" ? retryTextValue : "No response from the API after retry.";

        } catch (retryError) {
            console.error("Error calling Claude API on retry:", retryError);
            return JSON.stringify({});
        }
    }
}


// // Example usage
// const inputString = "Here is some text before the JSON. { \"key\": \"value\", \"number\": 123 } And here is text after.";
// const jsonObject = extractJSON(inputString);

// if (jsonObject) {
//     console.log("Extracted JSON:", jsonObject);
// } else {
//     console.log("No valid JSON found in the input.");
// }



export default chatClaudePrompt;
