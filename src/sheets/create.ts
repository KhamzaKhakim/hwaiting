import { getAuthToken } from "@/oauth/oauth";
import { BatchUpdate, CellFormat, Spreadsheet } from "./types";

const HEADER_STYLE = {
  textFormat: {
    bold: true,
    foregroundColorStyle: {
      rgbColor: {
        red: 1,
        green: 1,
        blue: 1,
      },
    },
  },
  horizontalAlignment: "CENTER",
  padding: {
    left: 10,
    right: 10,
    top: 5,
    bottom: 5,
  },
  borders: {
    top: { style: "SOLID", width: 1, color: { red: 0, green: 0, blue: 0 } },
    bottom: { style: "SOLID", width: 1, color: { red: 0, green: 0, blue: 0 } },
    left: { style: "SOLID", width: 1, color: { red: 0, green: 0, blue: 0 } },
    right: { style: "SOLID", width: 1, color: { red: 0, green: 0, blue: 0 } },
  },
  backgroundColorStyle: { rgbColor: { red: 0.26, green: 0.52, blue: 0.96 } },
} satisfies CellFormat;

export async function createSpreadsheet(title: string): Promise<string> {
  const token = await getAuthToken();

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
        sheets: [
          {
            properties: {
              title: "hwaiting",
            },
            data: [
              {
                startRow: 0,
                startColumn: 0,
                columnMetadata: [
                  { pixelSize: 250 },
                  { pixelSize: 150 },
                  { pixelSize: 140 },
                  { pixelSize: 150 },
                  { pixelSize: 200 },
                  { pixelSize: 120 },
                ],
                rowData: [
                  {
                    values: [
                      {
                        userEnteredValue: { stringValue: "Job Title" },
                        userEnteredFormat: HEADER_STYLE,
                      },
                      {
                        userEnteredValue: { stringValue: "Company" },
                        userEnteredFormat: HEADER_STYLE,
                      },
                      {
                        userEnteredValue: { stringValue: "Application Date" },
                        userEnteredFormat: HEADER_STYLE,
                      },
                      {
                        userEnteredValue: { stringValue: "Needed Experience" },
                        userEnteredFormat: HEADER_STYLE,
                      },
                      {
                        userEnteredValue: { stringValue: "Tech Stack" },
                        userEnteredFormat: HEADER_STYLE,
                      },
                      {
                        userEnteredValue: { stringValue: "Status" },
                        userEnteredFormat: HEADER_STYLE,
                      },
                    ],
                  },
                ],
              },
            ],
            tables: [
              {
                name: "JobApplications",
                range: {
                  startRowIndex: 0,
                  startColumnIndex: 0,
                  endColumnIndex: 6,
                },
              },
            ],
          },
        ],
      } satisfies Spreadsheet),
    },
  );

  const data = await response.json();
  const sheetId = data.sheets[0].properties.sheetId;

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${data.spreadsheetId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            setDataValidation: {
              range: {
                sheetId: sheetId,
                startRowIndex: 1, // Row 2 (skip header)
                endRowIndex: 1000, // Apply to 1000 rows
                startColumnIndex: 5, // Column F
                endColumnIndex: 6,
              },
              rule: {
                condition: {
                  type: "ONE_OF_LIST",
                  values: [
                    { userEnteredValue: "Applied" },
                    { userEnteredValue: "Interview" },
                    { userEnteredValue: "Offer" },
                    { userEnteredValue: "Rejected" },
                  ],
                },
                showCustomUi: true, // ← shows the dropdown arrow
                strict: true, // ← rejects values not in the list
              },
            },
          },
        ],
      } satisfies BatchUpdate),
    },
  );

  const appendResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${data.spreadsheetId}/values/hwaiting!A2:F2:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [
          [
            "Frontend Developer", // Job Title
            "Google", // Company
            "2026-03-25", // Application Date
            "3+ years", // Needed Experience
            "React, TypeScript", // Tech Stack
            "Applied", // Status
          ],
        ],
      }),
    },
  );

  const result = await appendResponse.json();
  console.log("Result: ", result);

  return data.spreadsheetId;
}
