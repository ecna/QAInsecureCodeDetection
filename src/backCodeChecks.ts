
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