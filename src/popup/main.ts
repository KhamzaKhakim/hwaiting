import { initAuth } from "@/oauth/oauth";
import "./style.css";
import { copySheet } from "@/sheets/copy";
import { appendValues } from "@/sheets/append";
import { getStorageValues, STORAGE_KEYS } from "@/helpers/storage";

function setButtonLoading(
  btn: HTMLButtonElement,
  loading: boolean,
  label?: string,
) {
  btn.disabled = loading;
  if (label !== undefined) btn.textContent = loading ? "Loading…" : label;
}

function showStatus(message: string, isError = false) {
  const existing = document.getElementById("status-msg");
  existing?.remove();

  const el = document.createElement("p");
  el.id = "status-msg";
  el.textContent = message;
  el.className = isError ? "status error" : "status success";

  document.querySelector("#app")?.appendChild(el);

  setTimeout(() => el.remove(), 3000);
}

function renderKeyForm() {
  return `
    <div class="flex-col">
      <input id="key-input" type="password" placeholder="Enter Gemini API key" />
      <button id="set-key">Save Key</button>
    </div>
  `;
}

function renderMain(spreadsheetId?: string) {
  const sheetSection = spreadsheetId
    ? `<p class="sheet-id" title="${spreadsheetId}">${spreadsheetId}</p>
       <button id="delete-btn">Delete Sheet</button>`
    : `<button id="upload-btn">Create Sheet</button>`;

  return `
    <div class="flex-col">
      <button id="read-btn">Add to Sheet</button>
      <button id="remove-key">Remove Key</button>
      ${sheetSection}
    </div>
  `;
}

function attachListeners() {
  document.getElementById("set-key")?.addEventListener("click", async (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    const input = document.getElementById("key-input") as HTMLInputElement;

    const trimmed = input.value.trim();
    if (!trimmed) {
      showStatus("Please enter a valid API key.", true);
      return;
    }

    setButtonLoading(btn, true, "Save Key");
    try {
      await chrome.storage.local.set({ [STORAGE_KEYS.GEMINI_KEY]: trimmed });
      await renderApp();
    } catch (err) {
      showStatus("Failed to save key. Please try again.", true);
      console.error("[set-key]", err);
    } finally {
      setButtonLoading(btn, false, "Save Key");
    }
  });

  document
    .getElementById("remove-key")
    ?.addEventListener("click", async (e) => {
      const btn = e.currentTarget as HTMLButtonElement;
      setButtonLoading(btn, true, "Remove Key");
      try {
        await chrome.storage.local.remove(STORAGE_KEYS.GEMINI_KEY);
        await renderApp();
      } catch (err) {
        showStatus("Failed to remove key.", true);
        console.error("[remove-key]", err);
      } finally {
        setButtonLoading(btn, false, "Remove Key");
      }
    });

  document.getElementById("read-btn")?.addEventListener("click", async (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    setButtonLoading(btn, true, "Add to Sheet");
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) {
        showStatus("No active tab found.", true);
        return;
      }

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "readDOM",
      });
      if (!response?.text) {
        showStatus("No content received from page.", true);
        return;
      }

      await appendValues(response.text);
      showStatus("Successfully added to sheet!");
    } catch (err) {
      showStatus("Failed to add to sheet. Is the page accessible?", true);
      console.error("[read-btn]", err);
    } finally {
      setButtonLoading(btn, false, "Add to Sheet");
    }
  });

  document
    .getElementById("upload-btn")
    ?.addEventListener("click", async (e) => {
      const btn = e.currentTarget as HTMLButtonElement;
      setButtonLoading(btn, true, "Create Sheet");
      try {
        const { id } = await copySheet();
        if (!id) throw new Error("No sheet ID returned.");

        await chrome.storage.local.set({ [STORAGE_KEYS.SPREADSHEET_ID]: id });

        const sheetUrl = `https://docs.google.com/spreadsheets/d/${id}`;
        window.open(sheetUrl, "_blank");

        showStatus("Sheet created successfully!");
        await renderApp();
      } catch (err) {
        showStatus("Failed to create sheet.", true);
        console.error("[upload-btn]", err);
      } finally {
        setButtonLoading(btn, false, "Create Sheet");
      }
    });

  document
    .getElementById("delete-btn")
    ?.addEventListener("click", async (e) => {
      const btn = e.currentTarget as HTMLButtonElement;
      setButtonLoading(btn, true, "Delete Sheet");
      try {
        await chrome.storage.local.remove(STORAGE_KEYS.SPREADSHEET_ID);
        showStatus("Sheet removed.");
        await renderApp();
      } catch (err) {
        showStatus("Failed to remove sheet.", true);
        console.error("[delete-btn]", err);
      } finally {
        setButtonLoading(btn, false, "Delete Sheet");
      }
    });
}

async function renderApp() {
  const { key, spreadsheetId } = await getStorageValues();

  document.querySelector("#app")!.innerHTML = key
    ? renderMain(spreadsheetId)
    : renderKeyForm();

  attachListeners();
}

(async () => {
  try {
    initAuth();
    await renderApp();
  } catch (err) {
    console.error("[init]", err);
  }
})();
