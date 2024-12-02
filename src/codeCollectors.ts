
// This file contains functions to collect code snippets from the current page and from a dataset.

var serverAddress = "";


// This function collects code snippets from the current page.
export function getCodeSnippets() {

  const codeSnippets: { code: string; language: string; }[] = [];
  const preElements = document.querySelectorAll('pre');

  preElements.forEach(element => {

    const codeElements = element.childNodes[0];
    if (codeElements) {
      const code = codeElements.textContent ? codeElements.textContent : "";
      const language = element.classList[0] ? element.classList[0] : "";

      if (code && code.length != 0) 
        {codeSnippets.push({ code, language });
      console.log(code)
    }
    }
  });

  return codeSnippets;
}

// This function collects code snippets from a dataset.
export async function getCodeFromDataset() {

  let codeSnippets: { code: string; language: string; }[] = [];

  if (serverAddress === "") {
    const APItoUse = await chrome.storage.sync.get(['datasetServer']);
    serverAddress = APItoUse['datasetServer'];
}

  try {
    // Fetch the data from the API. Which CWE's and how many must be placed in a config file
    const response = await fetch(serverAddress + '/?cwe=119&index=1');
    const resJson = await response.json();

    console.log(JSON.stringify(resJson.func_before));
    var lang = "lang-cpp";
    var code = resJson.func_before;
    codeSnippets.push({ language: lang, code: code });

  } catch (error) {
    console.warn('getData error', error);
  }

  return codeSnippets;
}
