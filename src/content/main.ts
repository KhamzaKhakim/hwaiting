console.log("[CRXJS] Hello world from content script!");

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === "readDOM") {
    const text = document.body.innerText; // read all text
    const modified = text.slice(0, 100).toUpperCase(); // change it a bit
    console.log("From content script:", modified);
    sendResponse({ text: modified });
  }
  return true; // keeps the message channel open for async response
});
