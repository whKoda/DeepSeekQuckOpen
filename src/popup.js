loadShortcuts();

document.getElementById("openSidePanel").addEventListener("click", async () => {
  await openSidePanel();
  window.close();
});

document.getElementById("openWindow").addEventListener("click", async () => {
  await send("OPEN_DEEPSEEK_WINDOW");
  window.close();
});

document.getElementById("openTab").addEventListener("click", async () => {
  await send("OPEN_DEEPSEEK_TAB");
  window.close();
});

document.getElementById("openShortcuts").addEventListener("click", async () => {
  await send("OPEN_SHORTCUTS_PAGE");
  window.close();
});

function send(type) {
  return chrome.runtime.sendMessage({ type });
}

async function openSidePanel() {
  if (typeof chrome.sidePanel?.open === "function") {
    try {
      const currentWindow = await chrome.windows.getCurrent();
      await chrome.sidePanel.open({ windowId: currentWindow.id });
      return { ok: true };
    } catch {
      return send("OPEN_SIDE_PANEL");
    }
  }

  return send("OPEN_SIDE_PANEL");
}

async function loadShortcuts() {
  if (!chrome.commands?.getAll) return;

  const commands = await chrome.commands.getAll();
  const shortcutByName = new Map(
    commands.map((command) => [command.name, command.shortcut || "未设置"])
  );

  document.querySelectorAll("[data-command]").forEach((node) => {
    node.textContent = normalizeShortcut(shortcutByName.get(node.dataset.command) || "未设置");
  });
}

function normalizeShortcut(shortcut) {
  return shortcut
    .replaceAll("Command", "⌘")
    .replaceAll("Ctrl", "⌃")
    .replaceAll("Alt", "⌥")
    .replaceAll("Shift", "⇧")
    .replaceAll("+", "");
}
