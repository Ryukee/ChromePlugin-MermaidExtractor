// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "searchMermaid",
      title: "搜索 Mermaid 图表",
      contexts: ["page"]
    });
  });
  
  // 处理右键菜单点击事件
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "searchMermaid") {
      // 打开弹出框
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
    }
  });
  
  // 监听来自 content.js 的消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "copyToClipboard") {
      // 响应消息已收到
      sendResponse({ status: "success" });
    }
  });