import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const Popup = () => {
  const [API, setAPI] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [datasetMode, setDatasetMode] = useState<boolean>(false);
  const [APIKeys, setAPIKeys] = useState<{ GPT: boolean; Gemini: boolean; Claude: boolean }>({
    GPT: false,
    Gemini: false,
    Claude: false,
  });

  
  useEffect(() => {
    // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    chrome.storage.sync.get(
      {
        usedAPIconnector: "Gemini",
        datasetModeOn: false,
      },
      (items) => {
        setAPI(items.usedAPIconnector);
        setDatasetMode(items.datasetModeOn);
        setAPIKeys({
          GPT: (items.GPT == "" ? false : true),
          Gemini:  (items.Gemini == "" ? false : true),
          Claude:  (items.Claude == "" ? false : true) ,
        });
      }
    );
  }, []);

  const saveOptions = () => {
    // Saves options to chrome.storage.sync.
    chrome.storage.sync.set(
      {
        usedAPIconnector: API,
        datasetModeOn: datasetMode,
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
      <div>
          Active API: <select style={{ minWidth: "250px" }}
          value={API}
          onChange={(event) => setAPI(event.target.value)}
        >
          <option value="Gemini" disabled={!APIKeys.Gemini}>Gemini</option>
          <option value="Claude" disabled={!APIKeys.Claude}>Claude</option>
          <option value="GPT" disabled={!APIKeys.GPT}>GPT</option>        
        </select>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={datasetMode}
            onChange={(event) => setDatasetMode(event.target.checked)}
          />
          dataset mode
        </label>
      </div>
      <div>{status}</div>
      <button onClick={saveOptions}>Save</button>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
