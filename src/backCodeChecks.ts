import chatClaudePrompt from "./apiConnectorClaude";
import chatGeminiPrompt from "./apiConnectorGemini";
import chatGPTPrompt from "./apiConnectorGPT";
import { ensureAPIConnectorIsSet } from "./checkDefaultSettings";
import { ensureDatasetModeIsSet } from "./checkDefaultSettings";
import { ensureDatasetServerIsSet } from "./checkDefaultSettings";
import { getStrategy } from "./promptStrategies";

ensureAPIConnectorIsSet();
ensureDatasetModeIsSet();
ensureDatasetServerIsSet();

// This function checks if the code snippet is in C++ language
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

// This function checks if the code snippet is secure by using the LLM model API's
async function checkCodeIsSecure(snippet: any): Promise<string> {
    
    const strategy  = await chrome.storage.sync.get(['strategy']);
    var promptStrategy = getStrategy(strategy['strategy']);

    const userPrompt = `${promptStrategy}\n${snippet}`;

    let result: string = "";
    var item;
    try {

        const APItoUse = await chrome.storage.sync.get(['usedAPIconnector']);
        item = APItoUse['usedAPIconnector'];

    }catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("An unknown error occurred");
        }

        throw new Error("Failed to get config");
    }


    try {
        var response;
        switch (item) {
            case 'Claude':
                // result = "- Claude \n\n";
                response = await chatClaudePrompt(userPrompt);
                break;
            case 'GPT':
                // result = "- GPT \n\n";
                response = await chatGPTPrompt(userPrompt);
                break;
            case 'Gemini':
                // result = "- Gemini \n\n";
                response = await chatGeminiPrompt(userPrompt);
                break;
            default:
                throw new Error(result + "Invalid API provider specified in configuration.");
        }
        response = JSON.stringify(extractJSON(response))
        response = response.replace(/```json|```/g, '');
        result += response ?? "No response from the API.";
        // console.log(result +  " API response:", response);
        return result;

    } catch (error) {
        if (error instanceof Error) {
            console.error(result + error.message);
        } else {
            console.error(result + "An unknown error occurred");
        }

        throw new Error(result + "Failed to fetch response from OpenAI API");
    }

}

export default checkCodeIsSecure;

interface JSONResult {
    [key: string]: any;
}

function extractJSON(inputString: string): JSONResult | null {
    try {
        // Match the JSON object within the string
        const jsonMatch = inputString.match(/\{.*\}/s); // This matches the first JSON object
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]); // Parse the matched JSON string
        } else {
            throw new Error("No JSON object found in the input string.");
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error extracting JSON:", error.message);
        } else {
            console.error("Error extracting JSON:", error);
        }
        return null;
    }
}



