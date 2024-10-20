document.addEventListener('DOMContentLoaded', function() {
  const keywordInput = document.getElementById('keyword');
  const searchBtn = document.getElementById('search-btn');
  const downloadLinkInput = document.getElementById('download-link');
  const copyBtn = document.getElementById('copy-btn');
  const downloadBtn = document.getElementById('download-btn');
  const statusDiv = document.getElementById('status');

  // 获取选中的文字
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "getSelection"}, function(response) {
      if (response && response.selection) {
        keywordInput.value = response.selection;
      }
    });
  });

  // 搜索按钮点击事件
  searchBtn.addEventListener('click', function() {
    const keyword = keywordInput.value;
    if (!keyword) {
      statusDiv.textContent = "请先选择关键词";
      return;
    }

    statusDiv.textContent = "正在搜索...";
    chrome.runtime.sendMessage({action: "search", keyword: keyword}, function(response) {
      if (response && response.downloadLink) {
        downloadLinkInput.value = response.downloadLink;
        downloadBtn.href = response.downloadLink;
        statusDiv.textContent = "搜索完成";
      } else {
        statusDiv.textContent = "未找到下载链接";
      }
    });
  });

  // 复制按钮点击事件
  copyBtn.addEventListener('click', function() {
    downloadLinkInput.select();
    document.execCommand('copy');
    statusDiv.textContent = "链接已复制";
  });
});
