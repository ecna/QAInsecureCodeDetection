
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
        if (!APItoUse) {
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

export default ensureAPIConnectorIsSet;