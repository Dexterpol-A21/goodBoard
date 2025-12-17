chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'index.html' });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startSync") {
    // Manual sync mode: Just acknowledge. The UI will guide the user.
    sendResponse({ status: "Manual Sync Mode" });
  }
});

// Removed automatic navigation logic to allow user-controlled sync.
async function syncData() {
  console.log("Manual Sync Mode enabled. Waiting for user navigation.");
}
