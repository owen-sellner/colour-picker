chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "updateColour") {
    chrome.storage.local.set({ colour: message.colour });
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id !== undefined) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
  }
});
