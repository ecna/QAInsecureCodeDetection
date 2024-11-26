import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

export function getSetting(): Promise<any> {
  return new Promise((resolve, reject) => {
      chrome.storage.sync.get("usedAPIconnector", (result) => {
          if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
          } else {
              resolve(result["usedAPIconnector"]);
          }
      });
  });
}



const Options = () => {
  const [API, setAPI] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [like, setLike] = useState<boolean>(false);

  
  useEffect(() => {
    // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    chrome.storage.sync.get(
      {
        usedAPIconnector: "Gemini",
        likesColor: true,
      },
      (items) => {
        setAPI(items.usedAPIconnector);
        setLike(items.likesColor);
      }
    );
  }, []);

  const saveOptions = () => {
    // Saves options to chrome.storage.sync.
    chrome.storage.sync.set(
      {
        usedAPIconnector: API,
        likesColor: like,
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
        APIconnector api: <select
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
            checked={like}
            onChange={(event) => setLike(event.target.checked)}
          />
          I like colors.
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
    <Options />
  </React.StrictMode>
);
