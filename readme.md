# Hwaiting

Hwaiting — a simple Chrome extension for people who are waiting for an offer. The job application tracker uses Gemini API to parse the page and Google Sheets to store your applications. Named after the Korean cheer [화이팅](https://en.wikipedia.org/wiki/Paiting).

## What it does

Open any job listing, click the Hwaiting button, and the extension automatically parses the page using Gemini AI, prefills a form with the job details, lets you review and edit, then pushes the row directly to your Google Sheet — no copy-pasting required.

## Tech stack

- **Gemini AI** — parses job posting pages to extract relevant details
- **Google Sheets API** — stores and organises your application data
- **Vite** + **CRXJS** — bundles and serves the Chrome extension with HMR
- **TypeScript** — type-safe throughout

## Good luck, job seekers. Hwaiting ✊

![Hwaiting](./public/hwaiting.gif)
