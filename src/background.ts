// function polling() {
//   // console.log("polling");
//   setTimeout(polling, 1000 * 30);
// }

// polling();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkCode") {
    const codeSnippets = request.code;
    const results: boolean[] = [];

    // Process each code snippet
    codeSnippets.forEach((snippet: any) => {

      results.push(checkCodeIsCpp(snippet));
    });

    // Send results back to content script
    sendResponse({ action: "codeChecked", results: results });
  }

});

function checkCodeIsCpp(snippet: any) {
  let result: boolean = false;
  return  snippet.language === 'language-cpp';
}

function checkCodeIsCppAI(snippet: any) {
  let result: boolean = false;
  // Call Gemini API here
  // Replace with your actual API call and processing logic
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
      // Assuming the API returns a language property
      result = data.language === "C++";
    })
    .catch(error => {
      console.error("Error checking code:", error);
    });

  return result;
}