// This function is used to check if the 'usedAPIconnector' setting is set in chrome.storage.sync.
async function ensureAPIConnectorIsSet(): Promise<void> {
    try {
        // Retrieve the value of 'usedAPIconnector' from chrome.storage.sync
        const result = await new Promise<{ usedAPIconnector?: string }>((resolve, reject) => {
            chrome.storage.sync.get(['usedAPIconnector'], (items) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(items);
                }
            });
        });

        // Check if 'usedAPIconnector' is not set or empty
        const APItoUse = result.usedAPIconnector;
        if (!APItoUse || APItoUse === "" || APItoUse === undefined) {
            // If not set, update it to "Gemini"
            await new Promise<void>((resolve, reject) => {
                chrome.storage.sync.set({ usedAPIconnector: "Gemini" }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });

            console.log("usedAPIconnector was empty or not set. Updated to 'Gemini'.");
        } else {
            console.log("usedAPIconnector is already set to:", APItoUse);
        }
    } catch (error) {
        console.error("Error ensuring API connector is set:", error);
    }
}

export {ensureAPIConnectorIsSet};

// This function is used to check if the 'datasetModeOn' setting is set in chrome.storage.sync.
async function ensureDatasetModeIsSet(): Promise<void> {
    try {
        // Retrieve the value of 'datasetModeOn' from chrome.storage.sync
        const result = await new Promise<{ datasetModeOn?: boolean }>((resolve, reject) => {
            chrome.storage.sync.get(['datasetModeOn'], (items) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(items);
                }
            });
        });

        // Check if 'datasetModeOn' is not set or false
        const datasetModeOn = result.datasetModeOn;
        if (datasetModeOn === undefined) {
            // If not set or false, update it to true
            await new Promise<void>((resolve, reject) => {
                chrome.storage.sync.set({ datasetModeOn: false }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });

            console.log("datasetModeOn was not set. Updated to false.");
        } else {
            console.log("datasetModeOn is already set to:", datasetModeOn);
        }
    } catch (error) {
        console.error("Error ensuring dataset mode is set:", error);
    }
}

export { ensureDatasetModeIsSet };