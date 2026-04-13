import { withRetry } from "@/helpers/utils";
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
  (e.g. "React, Node.js, PostgreSQL, AWS"). At most 6 items, try to get the most important ones.
- If a field is not found, write N/A
- Return ONLY the CSV row, no headers, no explanation, no markdown
- Wrap every field in double quotes, no exceptions

Page text:\n`;

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === "readDOM" && !!key) {
    (async () => {
      try {
        const text = document.body.innerText;

        const response = await withRetry(() =>
          ai.models.generateContent({
            model: "gemini-3.1-flash-lite-preview",
            contents: promt + text,
          }),
        );
        sendResponse({ text: response.text });
      } catch (err: any) {
        const is503 = err?.status === 503 || err?.message?.includes("503");
        sendResponse({
          error: is503
            ? "Gemini is overloaded, please try again."
            : "Failed to parse page",
        });
      }
    })();
  }

  return true;
});
