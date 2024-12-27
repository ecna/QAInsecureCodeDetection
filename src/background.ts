import { checkCodeIsCpp } from "./backCodeChecks";
import checkCodeIsSecure from "./backCodeChecks";
import { ensureAPIConnectorIsSet } from "./checkDefaultSettings";
import { ensureDatasetModeIsSet } from "./checkDefaultSettings";
import { ensureDatasetServerIsSet } from "./checkDefaultSettings";

ensureAPIConnectorIsSet();
ensureDatasetModeIsSet();
ensureDatasetServerIsSet();

// function polling() {
//   // console.log("polling");
//   setTimeout(polling, 1000 * 30);
// }

// polling();

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {

    const codeSnippets = request.code;

    const APItoUse = await chrome.storage.sync.get(['usedAPIconnector']);
     var API = APItoUse['usedAPIconnector'];

    if(request.action === "checkSettings") {
      sendResponse({ action: "settingsChecked" });
    }

    if (request.action === "checkCodeCPP") {
      const results: boolean[] = [];

      //result[0] = await checkCodeIsCpp(codeSnippets[0]);

      codeSnippets.forEach((snippet: any) => {

        results.push(checkCodeIsCpp(snippet));
      });

      sendResponse({ action: "codeCheckedCPP", results: results });
    }
    else if (request.action === "checkCodeSecure") {
      let codeSnippetsResult: { data: JSON; code: string; language: string; result: JSON }[] = [];

      for(var i =0; i < codeSnippets.length; i++)  {

        console.log("Code to check with " + API + " - number: " + i);
        
        var result = await checkCodeIsSecure(codeSnippets[i].code);

        const resultJSON = JSON.parse(result.replace(/\\/g, '').replace(/\n/g, ''));

        codeSnippetsResult.push({data: codeSnippets[i].data, language: codeSnippets[i].language, code: codeSnippets[i].code, result: resultJSON });

        
    }
    
    // const startTime = Date.now();
    // const waitTime = 10 * 1000; // 1 hour in milliseconds
    
    // const APItoUse = await chrome.storage.sync.get(['usedAPIconnector']);
    // var item = APItoUse['usedAPIconnector'];
    // console.log("API to use: ", item);  

    // while (Date.now() - startTime < waitTime) {
    //   const remainingTime = waitTime - (Date.now() - startTime);
    //   console.log(`Remaining time: ${Math.ceil(remainingTime / 1000 / 60)} minutes`);
    //   await new Promise(resolve => setTimeout(resolve, 60 * 1000)); // wait for 1 minute
    // }

    // console.log("timer ends");

    // sendResponse({ action: "codeCheckedSecure", results: {"result": {dummydata: "dummydata"}} });

    sendResponse({ action: "codeCheckedSecure", results: codeSnippetsResult });
    }

  })();

  return true;
});
