import { getCodeSnippets } from "./codeCollectors";
import { getCodeFromDataset } from "./codeCollectors";

start();

async function start() {
  const testMode = await chrome.storage.sync.get(['datasetModeOn']);

  if (testMode['datasetModeOn']) {
    console.log("\n\nTest mode is on: " + testMode['datasetModeOn'] + "\n\n");

    datasetMain();
  }
  else {
    console.log("\n\nTest mode is off: " + testMode['datasetModeOn'] + "\n\n");
    while (document.readyState != "complete") {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    webPageMain();
  }

}

async function datasetMain() {

  document.body.innerHTML = ''; 

  var codeFromDataset = await getCodeFromDataset();

  printResultInHTML('Code to Analyse', codeFromDataset[0].code, document.body);

  chrome.runtime.sendMessage({ action: "checkCodeSecure", code: codeFromDataset }, (response) => {
    // Got an asynchronous response with the data from the background script
    if (response.action === "codeCheckedSecure") {

      for (let i = 0; i < response.results.length; i++) {
        const result = response.results[i];

        printResultInHTML('Answer', result, document.body);
        console.log("\nResult:", result);
      }
    }
  });
}


function webPageMain() {
  
  var codeSnippert = getCodeSnippets();

  chrome.runtime.sendMessage({ action: "checkCodeCPP", code: codeSnippert }, (response) => {
    // Got an asynchronous response with the data from the background script
    if (response.action === "codeCheckedCPP") {
      const codeBlocks = document.querySelectorAll('pre code');

      for (let i = 0; i < codeBlocks.length; i++) {
        const result = response.results[i];

        const codeElement = codeBlocks[i] as HTMLElement;
        addCheckMark(codeElement, result);
      }
    }
  });

  setTimeout(() => {
    chrome.runtime.sendMessage({ action: "checkCodeSecure", code: codeSnippert }, (response) => {
      // Got an asynchronous response with the data from the background script
      if (response.action === "codeCheckedSecure") {
        const codeBlocks = document.querySelectorAll('pre code');

        for (let i = 0; i < codeBlocks.length; i++) {
          const result = response.results[i];

          console.log("\nResult:", result);

          const codeElement = codeBlocks[i] as HTMLElement;

          printResultInHTML('Answer', result, codeElement);
        }
      }
    });
  }, 200);

  function addCheckMark(codeElement: HTMLElement, isCpp: boolean) {
    const checkMark = document.createElement('div');
    checkMark.style.top = '5px';
    checkMark.style.right = '5px';
    checkMark.style.fontSize = '20px';
    checkMark.style.fontWeight = 'bold';
    checkMark.style.float = "right";
    checkMark.style.color = isCpp ? 'green' : 'red';
    checkMark.textContent = isCpp ? '✓' : '✗';
    if (codeElement.parentNode) codeElement.parentNode.insertBefore(checkMark, codeElement);
  }

}

function printResultInHTML(title: string, result: any, codeElement: HTMLElement) {
  const div = document.createElement('div');
  const heading = document.createElement('h1');
  heading.textContent = title;
  const paragraph = document.createElement('pre');
  paragraph.textContent = result;

  div.appendChild(heading);
  div.appendChild(paragraph);
  codeElement.appendChild(div);
}

