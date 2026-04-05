import { initAuth } from "@/oauth/oauth";
import { copySheet } from "@/sheets/copy";
import { appendValues } from "@/sheets/append";
import { getStorageValues, STORAGE_KEYS } from "@/helpers/storage";
import geminiLogo from "../assets/gemini.svg";
import { testGeminiKey } from "@/gemini/test";

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

function showKeyError(message: string) {
  const el = document.getElementById(
    "key-error",
  ) as HTMLParagraphElement | null;
  if (!el) return;
  el.textContent = message;
  el.style.display = message ? "block" : "none";
  el.style.color = "red";
  el.style.fontWeight = "bold";
}

function renderKeyForm() {
  return `
    <div class="flex-col">
      <div class="flex-col gap-0">
        <div class="flex items-center">
          <img src="${geminiLogo}" style="margin-right: 4px;" alt="Gemini" />
          <h2>Gemini API Setup</h2>
        </div>
        <p class="muted">Set up your Gemini API to automatically organize and send your data to Google Sheets. This is <span style="font-weight:bold;">required</span> to continue.</p>
      </div>
      <input id="key-input" placeholder="AIzaSy••••••••••••••••" />
      <p id="key-error" class="status error" style="display:none; margin: 0;"></p>
      <p class="label">
        Don't have a Gemini API key? See the instructions 
        <a href="https://ai.google.dev/gemini-api/docs/api-key" target="_blank" rel="noopener noreferrer">here</a>.
      </p>
      <button id="set-key-btn" class="submit" style="margin-top: 8px;">Save Key</button>
    </div>
  `;
}

function renderCreateSheetForm() {
  return `
    <div class="flex-col">
      <div class="flex-col gap-0">
          <h2>Create spreadsheet</h2>
        <p class="muted">In order to put values from sheet we first need to create spreadsheet. Please click to create sheet button to create it.</p>
      </div>
      <button id="create-sheet-btn" class="submit" style="margin-top: 8px;">Create Sheet</button>
    </div>
  `;
}

function renderMain() {
  return `
    <div class="flex-col">
      <button id="read-btn">Parse Page</button>
      <form id="job-form" class="flex-col">
        <div class="flex-col gap-0">
          <label for="job-title">Job Title</label>
          <input id="job-title" placeholder="e.g. Frontend Engineer" />
        </div>
        <div class="flex-col gap-0">
          <label for="company">Company</label>
          <input id="company" placeholder="e.g. Acme Corp" />
        </div>
        <div class="flex-col gap-0">
          <label for="experience">Needed Experience</label>
          <input id="experience" placeholder="e.g. 3+ years" />
        </div>
        <div class="flex-col gap-0">
          <label for="tech-stack">Tech Stack</label>
          <input id="tech-stack" placeholder="e.g. React, Node.js" />
        </div>
        <button id="add-to-sheet-btn" class="submit" disabled>Add to Sheet</button>
      </form>
    </div>
  `;
}

function renderSettings() {
  return `
    <div class="flex-col">
    <button id="a">Go to Sheet</button>
    <button id="remove-key">Remove Gemini Key</button>
    <button id="delete-btn">Remove Sheet</button>
    </div>
  `;
}

let isMain = true;

function addMenu() {
  const header = document.querySelector(".header");
  if (!header) return;

  header.insertAdjacentHTML(
    "beforeend",
    `
   <button>
      <div class="burger" id="burger">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </button>
  `,
  );

  const burger = document.getElementById("burger")!;

  burger.addEventListener("click", () => {
    isMain = !isMain;

    burger.classList.toggle("active");
    renderApp();
  });
}

function syncAddToSheetBtn() {
  const btn = document.getElementById(
    "add-to-sheet-btn",
  ) as HTMLButtonElement | null;
  if (!btn) return;
  const ids = ["job-title", "company", "experience", "tech-stack"];
  const allFilled = ids.every((id) =>
    (document.getElementById(id) as HTMLInputElement)?.value.trim(),
  );
  btn.disabled = !allFilled;
}

function attachListeners() {
  document.getElementById("key-input")?.addEventListener("input", () => {
    showKeyError("");
  });

  document
    .getElementById("set-key-btn")
    ?.addEventListener("click", async (e) => {
      const btn = e.currentTarget as HTMLButtonElement;
      const input = document.getElementById("key-input") as HTMLInputElement;
      const trimmed = input.value.trim();

      if (!trimmed) {
        showKeyError("Please enter a valid API key.");
        return;
      }

      setButtonLoading(btn, true, "Save Key");
      try {
        await testGeminiKey(trimmed);
        await chrome.storage.local.set({ [STORAGE_KEYS.GEMINI_KEY]: trimmed });
        await renderApp();
        showStatus("Key saved successfully!", false);
      } catch (err: any) {
        console.error("[set-key-btn]", err);
        const message = err?.message?.includes("API_KEY_INVALID")
          ? "Invalid API key."
          : "Failed to validate key.";
        showKeyError(message);
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

  ["job-title", "company", "experience", "tech-stack"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", syncAddToSheetBtn);
  });

  document.getElementById("read-btn")?.addEventListener("click", async (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    setButtonLoading(btn, true, "Parse Page");
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

      const rows = (response.text as string)
        .trim()
        .split("\n")
        .map((r) => r.split(",").map((v) => v.trim().replace(/^"|"$/g, "")));

      const [jobTitle, company, experience, techStack] = rows[rows.length - 1];

      (document.getElementById("job-title") as HTMLInputElement).value =
        jobTitle ?? "";
      (document.getElementById("company") as HTMLInputElement).value =
        company ?? "";
      (document.getElementById("experience") as HTMLInputElement).value =
        experience ?? "";
      (document.getElementById("tech-stack") as HTMLInputElement).value =
        techStack ?? "";

      syncAddToSheetBtn();
      showStatus("Page parsed successfully!");
    } catch (err) {
      showStatus("Failed to parse page.", true);
      console.error("[read-btn]", err);
    } finally {
      setButtonLoading(btn, false, "Parse Page");
    }
  });

  document
    .getElementById("add-to-sheet-btn")
    ?.addEventListener("click", async (e) => {
      const btn = e.currentTarget as HTMLButtonElement;
      setButtonLoading(btn, true, "Add to Sheet");
      try {
        const values = [
          (
            document.getElementById("job-title") as HTMLInputElement
          ).value.trim(),
          (document.getElementById("company") as HTMLInputElement).value.trim(),
          (
            document.getElementById("experience") as HTMLInputElement
          ).value.trim(),
          (
            document.getElementById("tech-stack") as HTMLInputElement
          ).value.trim(),
        ].join(",");

        await appendValues(values);
        showStatus("Successfully added to sheet!");

        (document.getElementById("job-title") as HTMLInputElement).value = "";
        (document.getElementById("company") as HTMLInputElement).value = "";
        (document.getElementById("experience") as HTMLInputElement).value = "";
        (document.getElementById("tech-stack") as HTMLInputElement).value = "";
      } catch (err) {
        showStatus("Failed to add to sheet.", true);
        console.error("[add-to-sheet-btn]", err);
      } finally {
        setButtonLoading(btn, false, "Add to Sheet");
      }
    });

  document
    .getElementById("create-sheet-btn")
    ?.addEventListener("click", async (e) => {
      const btn = e.currentTarget as HTMLButtonElement;
      setButtonLoading(btn, true, "Create Sheet");
      try {
        const { id } = await copySheet();
        if (!id) throw new Error("No sheet ID returned.");
        await chrome.storage.local.set({ [STORAGE_KEYS.SPREADSHEET_ID]: id });
        window.open(`https://docs.google.com/spreadsheets/d/${id}`, "_blank");
        showStatus("Sheet created successfully!");
        await renderApp();
      } catch (err) {
        showStatus("Failed to create sheet.", true);
        console.error("[create-sheet-btn]", err);
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

  console.log(key, spreadsheetId);

  document.querySelector("#app")!.innerHTML = key
    ? spreadsheetId
      ? isMain
        ? renderMain()
        : renderSettings()
      : renderCreateSheetForm()
    : renderKeyForm();

  if (key && spreadsheetId && !document.getElementById("burger")) {
    addMenu();
  }

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
