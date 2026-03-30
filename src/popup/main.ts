import { initAuth } from "@/oauth/oauth";
import "./style.css";
import { copySheet } from "@/sheets/copy";
import { appendValues } from "@/sheets/append";

async function renderApp() {
  const key = await chrome.storage.local
    .get(["gemini_key"])
    .then((v) => v?.gemini_key as string | undefined);

  const spreadsheetId = await chrome.storage.local
    .get(["spreadsheet_id"])
    .then((v) => v?.spreadsheet_id as string | undefined);

  console.log("spreadsheetId: ", spreadsheetId);

  document.querySelector("#app")!.innerHTML = key
    ? `
      <div class="flex-col">
       <button id="read-btn">Read DOM</button>
       <button id="remove-key">Remove Key</button>
       <button id="auth-btn">Get token</button>
       ${spreadsheetId ? ` <p>${spreadsheetId}</p><button id="delete-btn">Delete Sheet</button>` : `<button id="upload-btn">Create Sheet</button>`}
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
    chrome.tabs.sendMessage(
      tab.id!,
      { action: "readDOM" },
      async (response) => {
        console.log("Response:", response);

        await appendValues(response);
        console.log("Bone:");
      },
    );
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

  document.getElementById("upload-btn")?.addEventListener("click", async () => {
    const { id } = await copySheet();

    console.log(id);
    await chrome.storage.local.set({ spreadsheet_id: id });
    console.log("sheet id: ", id);

    console.log("Copy is done");

    const sheetUrl = `https://docs.google.com/spreadsheets/d/${id}`;
    window.open(sheetUrl, "_blank");

    renderApp();
  });

  document.getElementById("delete-btn")?.addEventListener("click", async () => {
    await chrome.storage.local.remove("spreadsheet_id");

    console.log("Sheet is removed");

    renderApp();
  });

  initAuth();
}

renderApp();
