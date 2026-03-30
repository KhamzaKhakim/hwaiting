import { GoogleGenAI } from "@google/genai";

const result = await chrome.storage.local.get(["gemini_key"]);
const key = result.gemini_key as string;

const ai = new GoogleGenAI({
  apiKey: key,
});

const promt = `Extract the following job listing details from the page text below and return them 
as a single row in CSV format with these exact headers:

Job Title, Company, Needed Experience, Tech Stack

Rules:
- Job Title: the exact position name
- Company: the hiring company name
- Needed Experience: summarize years and/or level (e.g. "3+ years, Mid-level")
- Tech Stack: comma-separated list of tools/languages/frameworks mentioned 
  (e.g. "React, Node.js, PostgreSQL, AWS")
- If a field is not found, write N/A
- Return ONLY the CSV row, no headers, no explanation, no markdown
- Wrap every field in double quotes, no exceptions

Page text:\n`;

chrome.runtime.onMessage.addListener(async (msg, _sender, sendResponse) => {
  console.log("Start gemini");
  if (msg.action === "readDOM" && !!key) {
    console.log("Start gemini");
    const text = document.body.innerText;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: promt + text,
    });

    console.log("Content response:");
    console.log(response.text);

    sendResponse({ text: response });
  }
  return true;
});
