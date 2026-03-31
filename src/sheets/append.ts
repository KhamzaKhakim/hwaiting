import { getAuthToken } from "@/oauth/oauth";

export async function appendValues(values: string): Promise<void> {
  const token = await getAuthToken();

  const cells = values
    .match(/(".*?"|[^,]+)/g)!
    .map((cell) => cell.replace(/^"|"$/g, "").trim());

  const today = new Date();
  const date = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

  cells.splice(2, 0, date);

  const spreadsheetId = await chrome.storage.local
    .get(["spreadsheet_id"])
    .then((v) => v?.spreadsheet_id as string | undefined);

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/hwaiting:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [[...cells, "Applied"]] }),
    },
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(
      `Sheets append failed: ${err.error?.message ?? res.statusText}`,
    );
  }
}
