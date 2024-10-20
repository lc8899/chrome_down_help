let isCollapsed = false;

function createUI() {
  const container = document.createElement('div');
  container.id = 'download-link-getter';
  container.innerHTML = `
    <h1>下载链接获取器</h1>
    <input type="text" id="keyword" placeholder="输入或选择关键词">
    <button id="search-btn">搜索</button>
    <div id="download-links">
      <h3>迅雷下载链接：</h3>
      <input type="text" id="thunder-link" readonly>
      <button id="copy-thunder-btn">复制链接</button>
      <a id="thunder-download-btn" target="_blank">直接下载</a>
      <h3>磁力下载链接：</h3>
      <input type="text" id="magnet-link" readonly>
      <button id="copy-magnet-btn">复制链接</button>
      <a id="magnet-download-btn" target="_blank">直接下载</a>
    </div>
    <div id="status"></div>
    <button id="clear-btn">清除</button>
  `;
  document.body.appendChild(container);

  // 添加折叠/展开功能
  const title = container.querySelector('h1');
  title.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    container.classList.toggle('collapsed', isCollapsed);
  });

  // 搜索按钮点击事件
  const searchBtn = container.querySelector('#search-btn');
  searchBtn.addEventListener('click', () => {
    const keyword = container.querySelector('#keyword').value;
    if (!keyword) {
      updateStatus("请输入或选择关键词");
      return;
    }
    updateStatus("正在搜索...");
    chrome.runtime.sendMessage({action: "search", keyword: keyword}, handleSearchResponse);
  });

  // 复制按钮点击事件
  const copyThunderBtn = container.querySelector('#copy-thunder-btn');
  const copyMagnetBtn = container.querySelector('#copy-magnet-btn');
  copyThunderBtn.addEventListener('click', () => copyLink('thunder-link'));
  copyMagnetBtn.addEventListener('click', () => copyLink('magnet-link'));

  // 清除按钮点击事件
  const clearBtn = container.querySelector('#clear-btn');
  clearBtn.addEventListener('click', clearAll);

  // 监听选中文本事件
  document.addEventListener('mouseup', () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      container.querySelector('#keyword').value = selectedText;
    }
  });
}

function copyLink(linkId) {
  const linkInput = document.querySelector(`#${linkId}`);
  linkInput.select();
  document.execCommand('copy');
  updateStatus(`${linkId === 'thunder-link' ? '迅雷' : '磁力'}链接已复制`);
}

function clearAll() {
  document.querySelector('#keyword').value = '';
  document.querySelector('#thunder-link').value = '';
  document.querySelector('#magnet-link').value = '';
  updateStatus('');
}

function handleSearchResponse(response) {
  const thunderLinkInput = document.querySelector('#thunder-link');
  const magnetLinkInput = document.querySelector('#magnet-link');
  const thunderDownloadBtn = document.querySelector('#thunder-download-btn');
  const magnetDownloadBtn = document.querySelector('#magnet-download-btn');

  if (response && response.thunderLink && response.magnetLink) {
    thunderLinkInput.value = response.thunderLink;
    magnetLinkInput.value = response.magnetLink;
    thunderDownloadBtn.href = response.thunderLink;
    magnetDownloadBtn.href = response.magnetLink;
    updateStatus("搜索完成");
  } else if (response && response.error) {
    let errorMessage = response.error;
    if (response.message) {
      errorMessage += `: ${response.message}`;
    }
    if (response.searchUrl) {
      errorMessage += `\n搜索URL: ${response.searchUrl}`;
    }
    if (response.resultUrl) {
      errorMessage += `\n结果URL: ${response.resultUrl}`;
    }
    updateStatus(errorMessage);
    console.error(errorMessage); // 在控制台也输出错误信息
  } else {
    updateStatus("未知错误");
  }
}

function updateStatus(message) {
  const statusDiv = document.querySelector('#download-link-getter #status');
  statusDiv.textContent = message;
}

createUI();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelection") {
    sendResponse({selection: window.getSelection().toString()});
  }
});
