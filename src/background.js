const DEEPSEEK_URL = "https://chat.deepseek.com/";
const ACTION_CLICK_BEHAVIOR_KEY = "actionClickBehavior";
const DEFAULT_ACTION_CLICK_BEHAVIOR = "menu";

let actionClickBehavior = DEFAULT_ACTION_CLICK_BEHAVIOR;

loadAndApplyActionClickBehavior();

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  createActionContextMenu();
  loadAndApplyActionClickBehavior();
});

chrome.runtime.onStartup.addListener(() => {
  createActionContextMenu();
  loadAndApplyActionClickBehavior();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes[ACTION_CLICK_BEHAVIOR_KEY]) {
    actionClickBehavior = normalizeActionClickBehavior(changes[ACTION_CLICK_BEHAVIOR_KEY].newValue);
    applyActionClickBehavior(actionClickBehavior);
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (actionClickBehavior === "side-panel") {
    openSidePanelFromCommand(tab);
    return;
  }

  if (actionClickBehavior === "window") {
    runCommand(openDeepSeekWindow);
    return;
  }

  if (actionClickBehavior === "tab") {
    runCommand(openDeepSeekTab);
  }
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "open-deepseek-side-panel") {
    openSidePanelFromCommand(tab);
  }

  if (command === "open-deepseek-window") {
    runCommand(openDeepSeekWindow);
  }

  if (command === "open-deepseek-tab") {
    runCommand(openDeepSeekTab);
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "open-deepseek-side-panel") {
    openSidePanelFromCommand(tab);
  }

  if (info.menuItemId === "open-options-page") {
    chrome.runtime.openOptionsPage();
  }
});

function createActionContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "open-deepseek-side-panel",
      title: "打开 DeepSeek 侧边栏",
      contexts: ["action"]
    });
    chrome.contextMenus.create({
      id: "open-options-page",
      title: "打开扩展选项",
      contexts: ["action"]
    });
  });
}

function openSidePanelFromCommand(tab) {
  if (typeof chrome.sidePanel?.open !== "function" || !tab?.windowId) {
    return;
  }

  chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {
    // Do not fall back to a tab or window for the side-panel shortcut.
  });
}

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

  if (message?.type === "OPEN_OPTIONS_PAGE") {
    chrome.runtime.openOptionsPage(() => {
      if (chrome.runtime.lastError) {
        sendResponse({ ok: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ ok: true });
      }
    });
    return true;
  }

  if (message?.type === "GET_ACTION_CLICK_BEHAVIOR") {
    getActionClickBehavior().then((behavior) => {
      sendResponse({ ok: true, behavior });
    }).catch((error) => {
      sendResponse({ ok: false, error: error.message });
    });
    return true;
  }

  if (message?.type === "SET_ACTION_CLICK_BEHAVIOR") {
    setActionClickBehavior(message.behavior).then((behavior) => {
      sendResponse({ ok: true, behavior });
    }).catch((error) => {
      sendResponse({ ok: false, error: error.message });
    });
    return true;
  }

  return false;
});

async function openSidePanel(windowId) {
  if (typeof chrome.sidePanel?.open !== "function") {
    throw new Error("Side panel API is not available.");
  }

  if (windowId) {
    await chrome.sidePanel.open({ windowId });
    return { ok: true };
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.windowId) {
    await chrome.sidePanel.open({ windowId: tab.windowId });
    return { ok: true };
  }

  const focusedWindow = await chrome.windows.getLastFocused({ windowTypes: ["normal"] });
  if (!focusedWindow?.id) {
    throw new Error("No focused browser window found.");
  }

  await chrome.sidePanel.open({ windowId: focusedWindow.id });
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

function runCommand(action, options = { fallbackToTab: true }) {
  action().catch(() => {
    if (options.fallbackToTab) {
      openDeepSeekTab();
    }
  });
}

async function loadAndApplyActionClickBehavior() {
  const behavior = await getActionClickBehavior();
  actionClickBehavior = behavior;
  await applyActionClickBehavior(behavior);
}

async function getActionClickBehavior() {
  const result = await chrome.storage.local.get(ACTION_CLICK_BEHAVIOR_KEY);
  return normalizeActionClickBehavior(result[ACTION_CLICK_BEHAVIOR_KEY]);
}

async function setActionClickBehavior(behavior) {
  const normalized = normalizeActionClickBehavior(behavior);
  await chrome.storage.local.set({ [ACTION_CLICK_BEHAVIOR_KEY]: normalized });
  actionClickBehavior = normalized;
  await applyActionClickBehavior(normalized);
  return normalized;
}

async function applyActionClickBehavior(behavior) {
  await chrome.action.setPopup({
    popup: behavior === "menu" ? "src/popup.html" : ""
  });
  await chrome.action.setTitle({
    title: getActionTitle(behavior)
  });
}

function normalizeActionClickBehavior(behavior) {
  if (behavior === "side-panel" || behavior === "window" || behavior === "tab") {
    return behavior;
  }

  return DEFAULT_ACTION_CLICK_BEHAVIOR;
}

function getActionTitle(behavior) {
  if (behavior === "side-panel") return "DeepSeek Quick Open - 打开侧边栏";
  if (behavior === "window") return "DeepSeek Quick Open - 独立窗口打开";
  if (behavior === "tab") return "DeepSeek Quick Open - 在标签页打开";
  return "DeepSeek Quick Open";
}
