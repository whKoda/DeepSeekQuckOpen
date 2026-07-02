# DeepSeek Quick Open

一个 Chromium Manifest V3 浏览器扩展，用于把 DeepSeek 官网放进浏览器侧边栏，也支持独立窗口和标签页打开。

## 功能

- 浏览器工具栏弹窗入口
- 侧边栏中打开 DeepSeek 官网
- 三个功能都支持快捷键配置
  - 侧边栏：默认 `Alt+Shift+S`
  - 独立窗口：默认 `Alt+Shift+D`
  - 标签页：默认 `Alt+Shift+T`
- 不保存 API Key，不管理聊天记录

## 安装

1. 打开 Chrome 或 Edge 的扩展管理页。
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
2. 开启“开发者模式”。
3. 点击“加载已解压的扩展程序”。
4. 选择本目录：`deepseek-sidebar-extension`。
5. 点击工具栏里的 DeepSeek Quick Open 图标，选择“打开侧边栏”。
6. 可在 `edge://extensions/shortcuts` 或 `chrome://extensions/shortcuts` 调整快捷键。

## 快捷键配置

点击扩展弹窗底部的“配置快捷键”，或手动打开：

- Edge: `edge://extensions/shortcuts`
- Chrome: `chrome://extensions/shortcuts`

浏览器扩展 API 只允许扩展声明可配置命令，不能由扩展直接替用户写入快捷键；实际快捷键必须由用户在该页面配置。

## 说明

DeepSeek 官网默认不适合被 iframe 嵌入。扩展使用 `declarativeNetRequest` 仅针对 DeepSeek 域名移除常见的 iframe 限制响应头，然后在 `chrome.sidePanel` 中加载官方网页。登录态仍由 DeepSeek 官网和浏览器 Cookie 管理。
