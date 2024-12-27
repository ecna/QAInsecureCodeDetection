import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { getStrategiesSize } from "./promptStrategies";




const Options = () => {
  const [API, setAPI] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [datasetMode, setDatasetMode] = useState<boolean>(false);
  const [APIKeys, setAPIKeys] = useState<{ GPT: string; Gemini: string; Claude: string }>({
    GPT: "",
    Gemini: "",
    Claude: "",
  });
  const [datasetServer, setDatasetServer] = useState<string>("");

  const [editKeys, setEditKeys] = useState<{ GPT: boolean; Gemini: boolean; Claude: boolean, datasetServer: boolean }>({
    GPT: false,
    Gemini: false,
    Claude: false,
    datasetServer: false,
  });

  const setEditKey = (key: "GPT" | "Gemini" | "Claude" | "datasetServer", value: boolean) => {
    setEditKeys((prevKeys) => ({ ...prevKeys, [key]: value }));
  };

  const [strategy, setStrategy] = useState<number>(0);

  useEffect(() => {
    // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    chrome.storage.sync.get(
      {
        usedAPIconnector: "Gemini",
        datasetModeOn: false,
        GPT: "",
        Gemini: "",
        Claude: "",
        datasetServer: "http://localhost:3000",
        strategy: 0,
      },
      (items) => {
        setAPI(items.usedAPIconnector);
        setDatasetMode(items.datasetModeOn);
        setAPIKeys({
          GPT: items.GPT,
          Gemini: items.Gemini,
          Claude: items.Claude,
        });
        setDatasetServer(items.datasetServer);
        setStrategy(items.strategy);
      }
    );
  }, []);

  const saveOptions = () => {
    // Saves options to chrome.storage.sync.
    const selectElement = document.querySelector(".selectAPI") as HTMLSelectElement;
    if (selectElement) {
      const options = selectElement.options;
      for (let i = 0; i < options.length; i++) {
        options[i].disabled = !APIKeys[options[i].value as keyof typeof APIKeys];
      }
    }
    chrome.storage.sync.set(
      {
        usedAPIconnector: API,
        datasetModeOn: datasetMode,
        GPT: APIKeys.GPT,
        Gemini: APIKeys.Gemini,
        Claude: APIKeys.Claude,
        datasetServer: datasetServer,
        strategy: strategy,
      },
      () => {
        // Update status to let user know options were saved.
        setStatus("Options saved.");
        const id = setTimeout(() => {
          setStatus("");
        }, 1000);
        return () => clearTimeout(id);
      }
    );
  };

  return (
    <>
      <h1>Options</h1>
      <style>{`
          .input-container {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
          }
          .save-container {
            display: flex;
            justify-content: flex-end;
            align-items: center;
          }
          .input-container label {
            width: 150px;
          }
          .input-container input {
            flex: 1;
          }
          .input-container button {
            margin-left: 10px;
          }
          .editButton {
            width: 100px;
          }
          .saveButton {
            width: 100px;
            align-items: right;
            margin-left: 10px;
          }
          .selectAPI {
            flex: 1;
          }
          #datasetMode {
            // flex: 1;
          }
        `}</style>

      <div className="input-container">
        <label>GPT API Key:</label>
        <input
          type="password"
          value={APIKeys.GPT}
          disabled={!editKeys.GPT}
          onChange={(event) => setAPIKeys({ ...APIKeys, GPT: event.target.value })}
        />
        <button className="editButton" onClick={() => setEditKey("GPT", !editKeys.GPT)}>
          {editKeys.GPT ? "Disable" : "Edit"}
        </button>
      </div>

      <div className="input-container">
        <label>Gemini API Key:</label>
        <input
          type="password"
          value={APIKeys.Gemini}
          disabled={!editKeys.Gemini}
          onChange={(event) => setAPIKeys({ ...APIKeys, Gemini: event.target.value })}
        />
        <button className="editButton" onClick={() => setEditKey("Gemini", !editKeys.Gemini)}>
          {editKeys.Gemini ? "Disable" : "Edit"}
        </button>
      </div>

      <div className="input-container">
        <label>Claude API Key:</label>
        <input
          type="password"
          value={APIKeys.Claude}
          disabled={!editKeys.Claude}
          onChange={(event) => setAPIKeys({ ...APIKeys, Claude: event.target.value })}
        />
        <button className="editButton" onClick={() => setEditKey("Claude", !editKeys.Claude)}>
          {editKeys.Claude ? "Disable" : "Edit"}
        </button>
      </div>

      <div className="input-container">
        <label>Active API: </label>

        <select className="selectAPI"
          value={API}
          onChange={(event) => setAPI(event.target.value)}
        >
          <option value="Gemini" disabled={!APIKeys.Gemini}>Gemini</option>
          <option value="Claude" disabled={!APIKeys.Claude}>Claude</option>
          <option value="GPT" disabled={!APIKeys.GPT}>GPT</option>
        </select>
      </div>

      <div className="input-container">
        <label>Strategy: </label>

        <select className="selectStrategy"
          value={strategy}
          onChange={(event) => setStrategy(Number(event.target.value))}
        >
          {Array.from({ length: getStrategiesSize() }, (_, i) => i).map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>


      
      <div className="input-container">
        
        <label>Dataset Server:</label>
        <input
          type="text"
          value={datasetServer}
          disabled={!editKeys.datasetServer}
          onChange={(event) => setDatasetServer(event.target.value)}
        />
        <button className="editButton" onClick={() => setEditKey("datasetServer", !editKeys.datasetServer)}>
          {editKeys.datasetServer ? "Disable" : "Edit"}
        </button>
      </div>
      <div className="input-container">
        <label>
          Dataset Mode:
        </label>
        <input
            type="checkbox"
            checked={datasetMode}
            onChange={(event) => setDatasetMode(event.target.checked)}
          />
          <div>When this is selected the dataset server is used</div>
      </div>
      <div className="save-container">
        <div>{status}</div>
        <button className="saveButton" onClick={saveOptions}>Save</button>
      </div>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
