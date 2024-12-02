chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "updateColour") {
    chrome.storage.local.set({ colour: message.colour });
  }
});
