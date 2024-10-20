chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("ContentScript received message:", request.action);
  
  if (request.action === "getSearchResults") {
    console.log("Searching for results...");
    const resultLink = document.evaluate('/html/body/div[1]/div[2]/div[2]/div[3]/div[1]/div[1]/h3/a', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (resultLink) {
      console.log("Search result found:", resultLink.href);
      sendResponse({ resultLink: resultLink.href });
    } else {
      console.log("No search results found");
      sendResponse({ error: "未找到搜索结果" });
    }
  } else if (request.action === "getDownloadLinks") {
    console.log("Searching for download links...");
    const thunderLink = document.evaluate('/html/body/div[1]/div[2]/div[4]/div/div[2]/div/a[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    const magnetLink = document.evaluate('/html/body/div[1]/div[2]/div[4]/div/div[2]/div/a[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    
    if (thunderLink && magnetLink) {
      console.log("Download links found:", thunderLink.href, magnetLink.href);
      sendResponse({ thunderLink: thunderLink.href, magnetLink: magnetLink.href });
    } else {
      console.log("No download links found");
      sendResponse({ error: "未找到下载链接" });
    }
  }
  return true;
});
