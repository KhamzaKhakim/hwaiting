import { getAuthToken } from "@/oauth/oauth";

export async function createSpreadsheet(title: string): Promise<string> {
  const token = await getAuthToken();

  console.log("token: ", token);

  const response = await fetch(
    "https://sheets.googleapis.com/v4/spreadsheets",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: { title },
      }),
    },
  );

  const data = await response.json();
  console.log(response.json());
  console.log("Spreadsheet ID: " + data.spreadsheetId);
  return data.spreadsheetId;
}
