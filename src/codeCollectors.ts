
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

  let codeSnippets: { data: JSON; code: string; language: string; result: JSON }[] = [];

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
    codeSnippets.push({data: resJson, language: lang, code: code,  result: JSON.parse(JSON.stringify({})) });

  } catch (error) {
    console.warn('getData error', error);
  }

  return codeSnippets;
}

// This function collects code snippets from a SARD dataset.
export async function getCodeFromSARDDataset() {

  let codeSnippets: { data: JSON; code: string; language: string; result: JSON }[] = [];

  if (serverAddress === "") {
    const APItoUse = await chrome.storage.sync.get(['datasetServer']);
    serverAddress = APItoUse['datasetServer'];
}

  try {
    // Fetch the data from the API. Which CWE's and how many must be placed in a config file
    const response = await fetch(serverAddress + '/sard_1000');
    const resJson = await response.json();
    codeSnippets = resJson;

  } catch (error) {
    console.warn('getData error', error);
  }

  return codeSnippets;
}

export async function getListFromDataset(cweList : JSON){
  let codeSnippets: { data: JSON; code: string; language: string; result: JSON }[] = [];

  if (serverAddress === "") {
    const APItoUse = await chrome.storage.sync.get(['datasetServer']);
    serverAddress = APItoUse['datasetServer'];
}

  try {
    // Fetch the data from the API. Which CWE's and how many must be placed in a config file
    const response = await fetch(serverAddress + "/multi", {
      method: "post",
      body: JSON.stringify(cweList)
    });

    const resJson = await response.json();

    var count = 0;
    resJson.forEach((item: any) => {

      console.log(count + " - " + JSON.stringify(item.cwe_ids[0].toString()));
      var lang = "lang-cpp";
      var code = item.func_before; //switch to get the code after .func

      codeSnippets.push({data: item, language: lang, code: code,  result: JSON.parse(JSON.stringify({})) });
      count++;
    });

  } catch (error) {
    console.warn('getData error', error);
  }

  return codeSnippets;
}
