chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "updateColour") {
    chrome.storage.local.set({ colour: message.colour });
  }
});

chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.tabId !== undefined) {
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      files: ["content.js"],
    });
  }
});
