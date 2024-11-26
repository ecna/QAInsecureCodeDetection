// runOnload();


// chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
//   if (msg.color) {
//     console.log("Receive color = " + msg.color);
//     document.body.style.backgroundColor = msg.color;
//     sendResponse("Change color to " + msg.color);
//   } else {
//     sendResponse("Color message is none.");
//   }
// });

// function runOnload(){
//   let codeSnippets: { code: string; language: string; }[] = [];
//   if(checkWebsiteIsTarget()){
//     codeSnippets = getCodeSnippets(); 
//   }
// }


// function checkWebsiteIsTarget(){
//   let isTarget = false;

//   if (window.location.hostname === "stackoverflow.com") {
//     isTarget = true;
//     console.log("This is Stack Overflow!");
//   }
  
//   return isTarget;
// }


// function getCodeSnippets() {
//     const codeElements = document.querySelectorAll('pre code');

//     codeElements.forEach(element => {
      
//       const language = element.classList[1]; 
//       const isCpp = language === 'language-cpp'; 
//       const codeElement = element as HTMLElement;
//       addCheckMark(codeElement, isCpp);
//     });

//     const codeSnippets: { code: string; language: string; }[] = [];
  
//     codeElements.forEach(element => {
  
//       const code = removeHTMLTags(element.innerHTML);
//       const language = element.classList[1];
  
//       codeSnippets.push({ code, language });
//     });

//     return codeSnippets;
// }

// function addCheckMark(codeElement: HTMLElement, isCpp: boolean) {
//   const checkMark = document.createElement('div');
//   checkMark.style.top = '5px';
//   checkMark.style.right = '5px';
//   checkMark.style.fontSize = '20px';
//   checkMark.style.fontWeight = 'bold';
//   checkMark.style.float = "right";
//   checkMark.style.color = isCpp ? 'green' : 'red';
//   checkMark.textContent = isCpp ? '✓' : '✗';
//   if(codeElement.parentNode) codeElement.parentNode.insertBefore(checkMark, codeElement);
// }

// function removeHTMLTags(htmlString: string) {

//   const parser = new DOMParser();
//   const doc = parser.parseFromString(htmlString, 'text/html');
//   const textContent = doc.body.textContent || "";

//   return textContent.trim();
// }