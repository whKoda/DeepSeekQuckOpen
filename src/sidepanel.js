const DEEPSEEK_URL = "https://chat.deepseek.com/";

const frame = document.getElementById("deepseekFrame");

document.getElementById("reload").addEventListener("click", () => {
  frame.src = DEEPSEEK_URL;
});

document.getElementById("openWindow").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "OPEN_DEEPSEEK_WINDOW" });
});

document.getElementById("openTab").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "OPEN_DEEPSEEK_TAB" });
});
