import { getAuthToken } from "@/oauth/oauth";

const TEMPLATE_FILE_ID = "1zji-uITnMyRfcJU58FxgBu94yAZAuCeGH_c_ngttkF8";

export async function copySheet() {
  const token = await getAuthToken();

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${TEMPLATE_FILE_ID}/copy`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Hwaiting " + new Date().toTimeString().split(" ")[0],
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed [${response.status}]: ${JSON.stringify(error)}`);
  }

  const result = await response.json();

  return result;
}
