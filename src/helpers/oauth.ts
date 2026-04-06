export function initAuth() {
  document.getElementById("auth-btn")?.addEventListener("click", function () {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
      console.log(JSON.stringify(token));
      console.log(token);
    });
  });
}

export function getAuthToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      resolve(token as string);
    });
  });
}
