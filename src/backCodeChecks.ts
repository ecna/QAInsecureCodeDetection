import chatClaudePrompt from "./APIconnectorClaude";
import chatGeminiPrompt from "./APIconnectorGemini";
import chatGPTPrompt from "./APIconnectorGPT";

export function checkCodeIsCpp(snippet: any) {
    let result: boolean = false;
    return snippet.language === 'lang-cpp';
}

export function checkCodeIsCppAI(snippet: any) {
    let result: boolean = false;
    // Call Gemini API here
    fetch('https://api.gemini.com/v1/code/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Add your API key or authentication headers
        },
        body: JSON.stringify({ code: snippet })
    })
        .then(response => response.json())
        .then(data => {
            result = data.language === "C++";
        })
        .catch(error => {
            console.error("Error checking code:", error);
        });

    return result;
}

let result: string = "";

export function checkCodeIsSecure(snippet: any) {

    
    (async () => {
        const userPrompt = `Analyze the following code for security issues:\n\n${snippet}`;
        try {
            //const response = await chatClaudePrompt(userPrompt);
            //const response = await chatGeminiPrompt(userPrompt);
            //const response = await chatGPTPrompt(userPrompt);
            const config = {
                apiProvider: 'Claude' // Change this to 'GPT' or 'Gemini' to use different APIs
            };

            let response;
            switch (config.apiProvider) {
                case 'Claude':
                    response = await chatClaudePrompt(userPrompt);
                    break;
                case 'GPT':
                    response = await chatGPTPrompt(userPrompt);
                    break;
                case 'Gemini':
                    response = await chatGeminiPrompt(userPrompt);
                    break;
                default:
                    throw new Error("Invalid API provider specified in configuration.");
            }
            result = response;
            console.log("API response:", response);
            return result ?? "No response from the API.";
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error("An unknown error occurred");
            }
        }
    })();

    return result;
}
