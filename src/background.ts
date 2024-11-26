import { checkCodeIsCpp, checkCodeIsSecure } from "./backCodeChecks";

// function polling() {
//   // console.log("polling");
//   setTimeout(polling, 1000 * 30);
// }

// polling();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkCodeCPP") {
    const codeSnippets = request.code;
    const results: boolean[] = [];

    codeSnippets.forEach((snippet: any) => {

      results.push(checkCodeIsCpp(snippet));
    });

    sendResponse({ action: "codeCheckedCPP", results: results });
  }
  else if (request.action === "checkCodeSecure") {
    const codeSnippets = request.code;
    const results: string[] = [];

    codeSnippets.forEach((snippet: any) => {

      results.push(checkCodeIsSecure(snippet.code));
    });
    
        sendResponse({ action: "codeCheckedSecure", results: results });
  }

});
