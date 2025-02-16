import { webToCode } from "./codeCollectors";
import { datasetToCode } from "./codeCollectors";
import { mvdatasetToCode } from "./codeCollectors";
import { sardDatasetToCode } from "./codeCollectors";
import { getStrategy } from "./strategyProvider";
import { dialog } from "./contentDialog";

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

  const strategy = await chrome.storage.sync.get(['strategy']);
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
  var codeFromDataset = await datasetToCode();

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

  var codeSnippert = webToCode();

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
    checkMark.id = 'detectionInfo';
    if (codeElement.parentNode) codeElement.parentNode.insertBefore(checkMark, codeElement);
  }

}

function printResultInHTML(title: string, result: any, codeElement: HTMLElement) {
  const div = document.createElement('div');
  div.innerHTML = dialog;

  const popupDialog = div.querySelector('#popup-dialog') as HTMLDialogElement;
  const openButton = div.querySelector('#open-dialog');
  const closeButton = div.querySelector('#close-dialog');
  const copyButton = div.querySelector('#copy-dialog');
  var contentExplanation = div.querySelector('#contentExplanation');

  if (contentExplanation) {
    const explanation = result.result.Explanation;
    contentExplanation.textContent = explanation;
  }

  var contentVul = div.querySelector('#contentVul');

  if (contentVul) {
    var vul = result.result.Vulnerabilities;
    var improve = result.result.Improvement;

    if (typeof vul === 'object' && vul !== null) {
      vul = Object.entries(vul).map(([key, value]) => ({ key, value }));
    }

    if (typeof improve === 'object' && improve !== null) {
      improve = Object.entries(improve).map(([key, value]) => ({ key, value }));
    }

    if (Array.isArray(vul)) {
      vul.forEach((item, index) => {
        var h3 = document.createElement('h3');
        h3.textContent = `${item.key}: ${item.value}`;
        if (contentVul) contentVul.appendChild(h3);

        if (Array.isArray(improve) && improve[index]) {
          var improveP = document.createElement('p');
          improveP.textContent = `${improve[index].value}`;
          if (contentVul) contentVul.appendChild(improveP);
        }
      });
    } else {
      const p = document.createElement('p');
      p.textContent = vul;
      contentVul.appendChild(p);
    }

  }

  var contentCode = div.querySelector('#contentCode');

  if (contentCode) {
    const code = result.result.FinalCode;
    const pre = document.createElement('pre');
    pre.textContent = code;
    contentCode.appendChild(pre);
  }

  if (openButton) {
    openButton.addEventListener("click", () => {
      popupDialog.showModal();
    });
  }

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      popupDialog.close();
    });
  }

  if (copyButton) {
    copyButton.addEventListener("click", () => {
      var copyText = document.getElementById("contentCode")?.textContent;
      if (copyText) {
        navigator.clipboard.writeText(copyText);
      } else {
        console.error('No text to copy.');
      }
    });
  }

  if (codeElement.parentNode) codeElement.parentNode.insertBefore(div, codeElement);
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

  var codeFromDataset = await mvdatasetToCode(jsonData);

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

  var codeFromDataset = await sardDatasetToCode();

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

