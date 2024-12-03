chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "updateColour") {
    chrome.storage.local.set({ colour: message.colour });
  }
});

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  if (tabs[0].id && tabs.length > 0) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle' });
  }
});
