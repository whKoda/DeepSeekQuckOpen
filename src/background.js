const DEEPSEEK_URL = "https://chat.deepseek.com/";

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "open-deepseek-side-panel") {
    runCommand(openSidePanel);
  }

  if (command === "open-deepseek-window") {
    runCommand(openDeepSeekWindow);
  }

  if (command === "open-deepseek-tab") {
    runCommand(openDeepSeekTab);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "OPEN_SIDE_PANEL") {
    openSidePanel(sender.tab?.windowId).then(sendResponse).catch((error) => {
      sendResponse({ ok: false, error: error.message });
    });
    return true;
  }

  if (message?.type === "OPEN_DEEPSEEK_WINDOW") {
    openDeepSeekWindow().then(sendResponse).catch((error) => {
      sendResponse({ ok: false, error: error.message });
    });
    return true;
  }

  if (message?.type === "OPEN_DEEPSEEK_TAB") {
    openDeepSeekTab().then(sendResponse).catch((error) => {
      sendResponse({ ok: false, error: error.message });
    });
    return true;
  }

  if (message?.type === "OPEN_SHORTCUTS_PAGE") {
    openShortcutsPage().then(sendResponse).catch((error) => {
      sendResponse({ ok: false, error: error.message });
    });
    return true;
  }

  return false;
});

async function openSidePanel(windowId) {
  if (typeof chrome.sidePanel?.open !== "function") {
    return openDeepSeekTab();
  }

  if (windowId) {
    await chrome.sidePanel.open({ windowId });
    return { ok: true };
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.windowId) {
    return openDeepSeekTab();
  }

  await chrome.sidePanel.open({ windowId: tab.windowId });
  return { ok: true };
}

async function openDeepSeekWindow() {
  const display = await getDisplaySize();
  const width = Math.min(980, Math.max(720, Math.round(display.width * 0.42)));
  const height = Math.min(960, Math.max(700, Math.round(display.height * 0.86)));

  return chrome.windows.create({
    url: DEEPSEEK_URL,
    type: "popup",
    left: Math.max(0, display.width - width - 48),
    top: 48,
    width,
    height,
    focused: true
  });
}

async function openDeepSeekTab() {
  return chrome.tabs.create({ url: DEEPSEEK_URL, active: true });
}

async function openShortcutsPage() {
  return chrome.tabs.create({ url: "chrome://extensions/shortcuts", active: true });
}

async function getDisplaySize() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.width && tab?.height) {
      return { width: tab.width, height: tab.height };
    }
  } catch {
    // Use conservative defaults below.
  }

  return { width: 1440, height: 900 };
}

function runCommand(action) {
  action().catch(() => openDeepSeekTab());
}
