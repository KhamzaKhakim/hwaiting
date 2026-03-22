import { GoogleGenAI } from "@google/genai";

console.log("[CRXJS] Hello world from content script!");

const ai = new GoogleGenAI({
  apiKey: import.meta.env.GEMINI_API_KEY,
});

chrome.runtime.onMessage.addListener(async (msg, _sender, sendResponse) => {
  if (msg.action === "readDOM") {
    const text = document.body.innerText;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Hello how are you?" + text.slice(20),
    });

    console.log("response: ", response);

    console.log("From content script:", response);
    sendResponse({ text: response });
  }
  return true; // keeps the message channel open for async response
});
