chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "updateColour") {
    chrome.storage.local.set({ colour: message.colour });
  }
});

// chrome.action.onClicked.addListener(() => {
//   chrome.storage.local.get(['isMenuOpen'], (result) => {
//     const isMenuOpen = result.isMenuOpen || false;
//     chrome.storage.local.set({ isMenuOpen: !isMenuOpen });
//   });
// });

chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) {
      chrome.scripting.executeScript({
          target: { tabId: details.tabId },
          files: ['content.js'],
      });
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
