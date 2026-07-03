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
- 提供扩展选项页和工具栏图标右键菜单入口
- 可配置工具栏图标左键默认行为：显示菜单、打开侧边栏、独立窗口、标签页

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

点击扩展弹窗底部的“扩展选项”或“配置快捷键”，也可以在扩展详情页打开“扩展选项”。手动路径：

- Edge: `edge://extensions/shortcuts`
- Chrome: `chrome://extensions/shortcuts`

浏览器扩展 API 只允许扩展声明可配置命令，不能由扩展直接替用户写入快捷键；实际快捷键必须由用户在该页面配置。

## 工具栏右键菜单

Chromium 不允许扩展覆盖工具栏图标右键本身的默认行为。右键会打开浏览器菜单；本扩展会在该菜单中添加“打开 DeepSeek 侧边栏”。

## 说明

DeepSeek 官网默认不适合被 iframe 嵌入。扩展使用 `declarativeNetRequest` 仅针对 DeepSeek 域名移除常见的 iframe 限制响应头，然后在 `chrome.sidePanel` 中加载官方网页。登录态仍由 DeepSeek 官网和浏览器 Cookie 管理。
