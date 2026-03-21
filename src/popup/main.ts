import { setupCounter } from "./counter.ts";
import "./style.css";

document.querySelector("#app")!.innerHTML = `
  <div>
   <button id="read-btn">Read DOM</button>
    <p class="read-the-docs">
      Click on the CRXJS logo to learn more
    </p>
  </div>
`;

// setupCounter(document.querySelector("#counter")!);

document.getElementById("read-btn")?.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id!, { action: "readDOM" }, (response) => {
    console.log("Modified text:", response.text);
  });
});
