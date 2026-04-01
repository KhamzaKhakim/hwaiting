export const STORAGE_KEYS = {
  GEMINI_KEY: "gemini_key",
  SPREADSHEET_ID: "spreadsheet_id",
} as const;

export async function getStorageValues() {
  const result = await chrome.storage.local.get([
    STORAGE_KEYS.GEMINI_KEY,
    STORAGE_KEYS.SPREADSHEET_ID,
  ]);
  return {
    key: result[STORAGE_KEYS.GEMINI_KEY] as string | undefined,
    spreadsheetId: result[STORAGE_KEYS.SPREADSHEET_ID] as string | undefined,
  };
}
