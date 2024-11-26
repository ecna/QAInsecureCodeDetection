import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const Popup = () => {
  const [API, setAPI] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [testMode, setTestMode] = useState<boolean>(false);

  
  useEffect(() => {
    // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    chrome.storage.sync.get(
      {
        usedAPIconnector: "Gemini",
        testModeOn: true,
      },
      (items) => {
        setAPI(items.usedAPIconnector);
        setTestMode(items.testModeOn);
      }
    );
  }, []);

  const saveOptions = () => {
    // Saves options to chrome.storage.sync.
    chrome.storage.sync.set(
      {
        usedAPIconnector: API,
        testModeOn: testMode,
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
        APIconnector api: <select style={{ minWidth: "250px" }}
          value={API}
          onChange={(event) => setAPI(event.target.value)}
        >
          <option value="Gemini">Gemini</option>
          <option value="Claude">Claude</option>
          <option value="GPT">GPT</option>          
        </select>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={testMode}
            onChange={(event) => setTestMode(event.target.checked)}
          />
          test mode
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
