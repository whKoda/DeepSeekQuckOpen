const COMMAND_LABELS = {
  "open-deepseek-side-panel": "在侧边栏打开 DeepSeek",
  "open-deepseek-window": "在独立窗口打开 DeepSeek",
  "open-deepseek-tab": "在标签页打开 DeepSeek"
};

document.getElementById("openSidePanel").addEventListener("click", () => {
  openSidePanel();
});

document.getElementById("openWindow").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "OPEN_DEEPSEEK_WINDOW" });
});

document.getElementById("openTab").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "OPEN_DEEPSEEK_TAB" });
});

document.getElementById("openShortcuts").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "OPEN_SHORTCUTS_PAGE" });
});

loadShortcuts();
loadActionBehavior();

document.getElementById("actionBehavior").addEventListener("change", async (event) => {
  if (event.target.name !== "actionBehavior") return;
  const response = await chrome.runtime.sendMessage({
    type: "SET_ACTION_CLICK_BEHAVIOR",
    behavior: event.target.value
  });
  renderBehaviorStatus(response?.ok ? "已保存工具栏图标左键行为。" : "保存失败，请重试。");
});

async function openSidePanel() {
  if (typeof chrome.sidePanel?.open === "function") {
    try {
      const currentWindow = await chrome.windows.getCurrent();
      await chrome.sidePanel.open({ windowId: currentWindow.id });
      return;
    } catch {
      // Fall through to background handling below.
    }
  }

  chrome.runtime.sendMessage({ type: "OPEN_SIDE_PANEL" });
}

async function loadShortcuts() {
  const commands = await chrome.commands.getAll();
  const list = document.getElementById("shortcuts");
  list.replaceChildren();

  for (const command of commands) {
    if (!COMMAND_LABELS[command.name]) continue;
    const row = document.createElement("div");
    row.className = "shortcut-row";

    const label = document.createElement("span");
    label.textContent = COMMAND_LABELS[command.name];

    const shortcut = document.createElement("kbd");
    shortcut.textContent = normalizeShortcut(command.shortcut || "未设置");

    row.append(label, shortcut);
    list.append(row);
  }
}

async function loadActionBehavior() {
  const response = await chrome.runtime.sendMessage({ type: "GET_ACTION_CLICK_BEHAVIOR" });
  const behavior = response?.behavior || "menu";
  const input = document.querySelector(`input[name="actionBehavior"][value="${behavior}"]`);
  if (input) input.checked = true;
}

function renderBehaviorStatus(message) {
  document.getElementById("behaviorStatus").textContent = message;
}

function normalizeShortcut(shortcut) {
  return shortcut
    .replaceAll("Command", "⌘")
    .replaceAll("Ctrl", "⌃")
    .replaceAll("Alt", "⌥")
    .replaceAll("Shift", "⇧")
    .replaceAll("+", "");
}
