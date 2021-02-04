
// let activeTabId = 0;

// chrome.tabs.onActivated.addListener((tab) => {
//   chrome.tabs.get(tab.tabId, (current_tab_info) => {
//     activeTabId = tab.tabId;
//     console.log(current_tab_info.url);
//     if (/^https:\/\/www\.google/.test(current_tab_info.url)) {
//       chrome.tabs.insertCSS(null, { file: "./styles.css" });
//       chrome.tabs.executeScript(null, { file: "./foreground.js" }, () =>
//         console.log("injected")
//       );
//     }
//   });
// });

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.message === "yo chekc the storage") {
//     chrome.tabs.sendMessage(activeTabId, { message: "yo i got your message" });
//     // sendResponse({ message: "yo i got your message" });
//     chrome.storage.local.get("password", (value) => {
//       console.log(value);
//     });
//   }
// });
