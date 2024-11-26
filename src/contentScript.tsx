import { getCodeSnippets } from "./contentPageContol";

setTimeout(() => {
  chrome.runtime.sendMessage({ action: "checkCodeCPP", code: getCodeSnippets() }, (response) => {
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
}, 0);


setTimeout(() => {
  chrome.runtime.sendMessage({ action: "checkCodeSecure", code: getCodeSnippets() }, (response) => {
    // Got an asynchronous response with the data from the background script
    if (response.action === "codeCheckedSecure") {
      const codeBlocks = document.querySelectorAll('pre code');

      for (let i = 0; i < codeBlocks.length; i++) {
        const result = response.results[i];

        console.log("Result: ", result);
      }
    }
  });
}, 0);

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

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.color) {
    console.log("Receive color = " + msg.color);
    document.body.style.backgroundColor = msg.color;
    sendResponse("Change color to " + msg.color);
  } else {
    sendResponse("Color message is none.");
  }
});
