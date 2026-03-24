export function initAuth() {
  document.getElementById("auth-btn")?.addEventListener("click", function () {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
      console.log(token);
    });
  });
}
