import { getCodeSnippets } from "./codeCollectors";
import { getCodeFromDataset } from "./codeCollectors";
import { getListFromDataset } from "./codeCollectors";
import { getCodeFromSARDDataset } from "./codeCollectors";
import { getStrategy } from "./promptStrategies";


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

  chrome.runtime.sendMessage({ action: "checkSettings" }, (response) => {
    // Got an asynchronous response with the data from the background script
    if (response.action === "settingsChecked") {
      console.log("Settings checked: ");
    }
  });

  const strategy  = await chrome.storage.sync.get(['strategy']);
    var promptStrategy = getStrategy(strategy['strategy']);

    const blob = new Blob([promptStrategy], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    var datasetSubset = document.createElement('div');
  
    const a = document.createElement('a');
  
    a.textContent = 'Download Strategy';
    a.href = url;
    a.download = 'strategy.txt';
  
    datasetSubset.appendChild(a);
    document.body.appendChild(datasetSubset);

  /////////////////////////////////////////////////////////////////////////////////////////////////////
  // test with only one code snippet
  // await codeSnippetRun();

  /////////////////////////////////////////////////////////////////////////////////////////////////////
  // real experiment with data from megavul dataset (runscript) 
  //datasetRunScript();

  /////////////////////////////////////////////////////////////////////////////////////////////////////
  // real experiment with data from SARD dataset
  datasetRun();

}


async function codeSnippetRun() {
  var codeFromDataset = await getCodeFromDataset();

  printResultInHTML('Code to Analyse', codeFromDataset[0].code, document.body);

  var APIobj = await chrome.storage.sync.get(['usedAPIconnector']);
  var API = APIobj['usedAPIconnector'];

  chrome.runtime.sendMessage({ action: "checkCodeSecure", code: codeFromDataset }, (response) => {
    // Got an asynchronous response with the data from the background script
    if (response.action === "codeCheckedSecure") {

      for (let i = 0; i < response.results.length; i++) {
        const result = JSON.stringify(response.results[i].result);

        printResultInHTML('Answer', result, document.body);
        console.log("\nResult:", result);

        const blob = new Blob([JSON.stringify(response.results)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        var gptResponse = document.createElement('div');
        const a = document.createElement('a');

        a.textContent = 'Download ' + API + ' results';
        a.href = url;
        a.download = 'response' + API + '.json';

        gptResponse.appendChild(a);
        document.body.appendChild(gptResponse);
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

function datasetRunScript() {

  printUploadScriptInHTML();
}

function printUploadScriptInHTML() {
  const uploadDiv = document.createElement('div');
  uploadDiv.id = 'uploadDiv';
  uploadDiv.style.margin = '20px';

  const uploadLabel = document.createElement('label');
  uploadLabel.textContent = 'Upload JSON file: ';
  uploadLabel.htmlFor = 'jsonUpload';

  const uploadInput = document.createElement('input');
  uploadInput.type = 'file';
  uploadInput.id = 'jsonUpload';
  uploadInput.accept = '.json';


  uploadInput.addEventListener('change', async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const text = await file.text();
      var jsonData: { [x: string]: any; } = {};
      var validJSON = checkJSONfile(jsonData, text);
      if (validJSON) {

        const uploadElement = document.getElementById('uploadDiv');

        if (uploadElement) {
          uploadElement.remove();
        }

        var jsonDataResult = JSON.parse(text);

        var wait = document.createElement('div');
        wait.id = "wait-subdataset";

        wait.textContent = "wait for subset of dataset...\n\n";
        document.body.append(wait);

        await collectCode(jsonDataResult);

        const waitElement = document.getElementById('wait-subdataset');

        if (waitElement) {
          waitElement.remove();
        }
      }
    }
    else {
      console.error('No file selected.');
      alert('No file selected.');
    }
  });

  uploadDiv.appendChild(uploadLabel);
  uploadDiv.appendChild(uploadInput);
  document.body.appendChild(uploadDiv);

}


function checkJSONfile(jsonData: { [x: string]: any; }, text: string) {
  var valid = false;

  try {
    jsonData = JSON.parse(text);
    console.log('Valid JSON file uploaded.');
  } catch (e) {
    console.error('Invalid JSON file. Please upload a correct JSON file.');
    alert('Invalid JSON file. Please upload a correct JSON file.');
  }

  console.log('Uploaded JSON data:', jsonData);
  // You can add further processing of the jsonData here
  if (jsonData) {
    const isValid = Object.keys(jsonData).every(key => {
      if (!/^\d+$/.test(key)) return false;
      const subKey = jsonData[key];
      return subKey && typeof subKey.amount === 'number';
    });

    if (isValid) {
      console.log('JSON data is valid.');
      valid = true;
    } else {
      console.error('JSON data is invalid. Keys must be numeric strings with subkeys containing an amount number.');
      alert('JSON data is invalid. Keys must be numeric strings with subkeys containing an amount number.');
    }
  }

  return valid;
}

async function collectCode(jsonData: JSON) {

  var codeFromDataset = await getListFromDataset(jsonData);

  const blob = new Blob([JSON.stringify(codeFromDataset)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  var datasetSubset = document.createElement('div');

  const a = document.createElement('a');

  a.textContent = 'Download sub-dataset';
  a.href = url;
  a.download = 'dataset_subset.json';

  datasetSubset.appendChild(a);
  document.body.appendChild(datasetSubset);

  await analyseCodesnippetsWithAPI(codeFromDataset, "Gemini");
  await analyseCodesnippetsWithAPI(codeFromDataset, "GPT");
  await analyseCodesnippetsWithAPI(codeFromDataset, "Claude");
  
}

const waitUntil = (condition: () => any, checkInterval = 100) => {
  return new Promise<void>(resolve => {
    let interval = setInterval(() => {
      if (!condition()) return;
      clearInterval(interval);
      resolve();
    }, checkInterval)
  })
}

async function analyseCodesnippetsWithAPI(codeFromDataset: { data: JSON; code: string; language: string; result: JSON; }[], API: string) {

  var gptPreInfo = document.createElement('div');
  gptPreInfo.id = "api-pre-info";
  gptPreInfo.textContent = "analyzing code snippets with: " + API + "\n\n";
  document.body.append(gptPreInfo);

  while (!document.getElementById('api-pre-info')) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  var currentAPI = await chrome.storage.sync.get(['usedAPIconnector']);

  if (currentAPI['usedAPIconnector'] != API) {
    await chrome.storage.sync.set({ 'usedAPIconnector': API });
  }

  var flag = false;

  chrome.runtime.sendMessage({ action: "checkCodeSecure", code: codeFromDataset }, (response) => {
    // Got an asynchronous response with the data from the background script
    if (response.action === "codeCheckedSecure") {

      const waitGPT = document.getElementById('api-pre-info');
      if (waitGPT) {
        waitGPT.remove();
      }

      const blob = new Blob([JSON.stringify(response.results)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      var gptResponse = document.createElement('div');
      const a = document.createElement('a');

      a.textContent = 'Download ' + API + ' results';
      a.href = url;
      a.download = 'response' + API + '.json';

      gptResponse.appendChild(a);
      document.body.appendChild(gptResponse);

      flag = true;

    }
  });

  await waitUntil(() => flag == true);

}

async function datasetRun() {

  var codeFromDataset = await getCodeFromSARDDataset();

  const blob = new Blob([JSON.stringify(codeFromDataset)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  var datasetSubset = document.createElement('div');

  const a = document.createElement('a');

  a.textContent = 'Download sub-dataset';
  a.href = url;
  a.download = 'dataset_subset.json';

  datasetSubset.appendChild(a);
  document.body.appendChild(datasetSubset);

  
  await analyseCodesnippetsWithAPI(codeFromDataset, "Gemini");
  await analyseCodesnippetsWithAPI(codeFromDataset, "GPT");
  await analyseCodesnippetsWithAPI(codeFromDataset, "Claude");
    
}

