chrome.browserAction.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, {action: "toggleUI"});
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "search") {
    searchDownloadLinks(request.keyword, sendResponse);
    return true; // 保持消息通道开放
  }
});

function searchDownloadLinks(keyword, sendResponse) {
  const searchUrl = `https://clmclm.com/search-${encodeURIComponent(keyword)}-0-0-1.html`;
  console.log(`正在搜索URL: ${searchUrl}`);

  chrome.tabs.create({ url: searchUrl, active: false }, (tab) => {
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === tab.id && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        
        chrome.tabs.executeScript(tab.id, { file: 'contentScript.js' }, () => {
          if (chrome.runtime.lastError) {
            console.error("执行contentScript.js时出错:", chrome.runtime.lastError);
            sendResponse({ error: "执行脚本时出错", message: chrome.runtime.lastError.message });
            chrome.tabs.remove(tab.id);
            return;
          }

          chrome.tabs.sendMessage(tab.id, { action: "getSearchResults" }, (response) => {
            if (chrome.runtime.lastError) {
              console.error("获取搜索结果时出错:", chrome.runtime.lastError);
              sendResponse({ error: "获取搜索结果时出错", message: chrome.runtime.lastError.message });
              chrome.tabs.remove(tab.id);
              return;
            }

            if (response && response.resultLink) {
              chrome.tabs.update(tab.id, { url: response.resultLink }, () => {
                chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                  if (tabId === tab.id && info.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(listener);

                    chrome.tabs.executeScript(tab.id, { file: 'contentScript.js' }, () => {
                      if (chrome.runtime.lastError) {
                        console.error("执行contentScript.js时出错:", chrome.runtime.lastError);
                        sendResponse({ error: "执行脚本时出错", message: chrome.runtime.lastError.message });
                        chrome.tabs.remove(tab.id);
                        return;
                      }

                      chrome.tabs.sendMessage(tab.id, { action: "getDownloadLinks" }, (finalResponse) => {
                        if (chrome.runtime.lastError) {
                          console.error("获取下载链接时出错:", chrome.runtime.lastError);
                          sendResponse({ error: "获取下载链接时出错", message: chrome.runtime.lastError.message });
                        } else if (finalResponse && finalResponse.thunderLink && finalResponse.magnetLink) {
                          sendResponse({ thunderLink: finalResponse.thunderLink, magnetLink: finalResponse.magnetLink });
                        } else {
                          sendResponse({ error: "未找到下载链接" });
                        }
                        chrome.tabs.remove(tab.id);
                      });
                    });
                  }
                });
              });
            } else {
              sendResponse({ error: "未找到搜索结果" });
              chrome.tabs.remove(tab.id);
            }
          });
        });
      }
    });
  });
}
