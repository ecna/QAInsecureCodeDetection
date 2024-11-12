import { checkCodeIsCpp } from "./backCodeChecks";

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
