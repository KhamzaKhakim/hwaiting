import { getAuthToken } from "@/oauth/oauth";

export async function createSpreadsheet(title: string): Promise<string> {
  const token = await getAuthToken();

  console.log("token: ", token);

  //   Job Title, Company, Needed Experience, Tech Stack

  const response = await fetch(
    "https://sheets.googleapis.com/v4/spreadsheets",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: { title }, // workbook name
        sheets: [
          {
            properties: {
              title: "hwaiting",
            },
            data: [
              {
                startRow: 0,
                startColumn: 0,
                rowData: [
                  {
                    values: [
                      { userEnteredValue: { stringValue: "Job Title" } },
                      { userEnteredValue: { stringValue: "Company" } },
                      { userEnteredValue: { stringValue: "Application Date" } },
                      {
                        userEnteredValue: { stringValue: "Needed Experience" },
                      },
                      {
                        userEnteredValue: { stringValue: "Tech Stack" },
                      },
                      {
                        userEnteredValue: { stringValue: "Status" },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }),
    },
  );

  const data = await response.json();
  console.log(data);
  console.log("Spreadsheet ID: " + data.spreadsheetId);
  return data.spreadsheetId;
}
