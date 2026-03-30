import { initAuth } from "@/oauth/oauth";
import "./style.css";
import { createSpreadsheet } from "@/sheets/create";
import { copySheet } from "@/sheets/copy";

async function renderApp() {
  const key = await chrome.storage.local
    .get(["gemini_key"])
    .then((v) => v?.gemini_key as string | undefined);

  const spreadsheetId = await chrome.storage.local
    .get(["spreadsheet_id"])
    .then((v) => v?.spreadsheet_id as string | undefined);

  console.log(typeof spreadsheetId);

  document.querySelector("#app")!.innerHTML = key
    ? `
      <div class="flex-col">
       <button id="read-btn">Read DOM</button>
       <button id="remove-key">Remove Key</button>
       <button id="auth-btn">Get token</button>
       <button id="upload-btn">Upload</button>
       ${spreadsheetId ? ` <p>${spreadsheetId}</p>` : `<button id="create-btn">Create</button>`}
      </div>
    `
    : `
      <div class="flex-col">
        <input id="key-input" type="text" placeholder="Enter Gemini API key" />
        <button id="set-key">Save Key</button>
      </div>
    `;

  document.getElementById("read-btn")?.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.tabs.sendMessage(tab.id!, { action: "readDOM" }, (response) => {
      console.log("Response:", response);
    });
  });

  document.getElementById("remove-key")?.addEventListener("click", async () => {
    await chrome.storage.local.remove("gemini_key");
    renderApp(); // Re-render after saving
  });

  document.getElementById("set-key")?.addEventListener("click", async () => {
    const input = document.getElementById("key-input") as HTMLInputElement;
    await chrome.storage.local.set({ gemini_key: input.value });
    renderApp(); // Re-render after saving
  });

  document.getElementById("create-btn")?.addEventListener("click", async () => {
    const id = await createSpreadsheet(
      "test-" +
        new Date().toLocaleTimeString(navigator.language, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
    );
    await chrome.storage.local.set({ spreadsheet_id: id });
    console.log("sheet id: ", id);

    renderApp();
  });

  document.getElementById("upload-btn")?.addEventListener("click", async () => {
    const id = await copySheet();
    // await chrome.storage.local.set({ spreadsheet_id: id });
    console.log("Copy is done");

    renderApp();
  });

  initAuth();
}

renderApp();
