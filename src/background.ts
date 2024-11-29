import { checkCodeIsCpp } from "./backCodeChecks";
import checkCodeIsSecure from "./backCodeChecks";

// function polling() {
//   // console.log("polling");
//   setTimeout(polling, 1000 * 30);
// }

// polling();

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {

    const codeSnippets = request.code;

    if (request.action === "checkCodeCPP") {
      const results: boolean[] = [];

      //result[0] = await checkCodeIsCpp(codeSnippets[0]);

      codeSnippets.forEach((snippet: any) => {

        results.push(checkCodeIsCpp(snippet));
      });

      sendResponse({ action: "codeCheckedCPP", results: results });
    }
    else if (request.action === "checkCodeSecure") {
      const results: string[] = [];

      for(var i =0; i < codeSnippets.length; i++)  {

        var result = await checkCodeIsSecure(codeSnippets[i].code);
        results.push(result);
        
    }
    sendResponse({ action: "codeCheckedSecure", results: results });
    }

  })();

  return true;
});
