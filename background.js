let refreshIntervalId = null;
const previousContent = new Map();

function startRefreshing(url, interval) {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
  }

  refreshIntervalId = setInterval(() => {
    refreshTabs(url);
  }, interval * 1000);

  console.log("refreshing started");
}

function stopRefreshing() {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
}

function refreshTabs(url) {
  chrome.tabs.query({}, function (tabs) {
    for (const tab of tabs) {
      if (new URL(tab.url).href === new URL(url).href) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            function: getPageContent
          },
          (results) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              return;
            }
            compareAndNotifyContent(results, tab.id, url);
          }
        );

        chrome.tabs.reload(tab.id);
        console.log("refreshing tab");
        break;
      }
    }
  });
}

function compareAndNotifyContent(results, tabId, url) {
  if (results && results.length > 0) {
    const currentContent = results[0].result;
    if (previousContent.has(url)) {
      const prevContent = previousContent.get(url);
      if (prevContent !== currentContent) {
        showNotification();
        console.log("new content found");
      }
    }
    previousContent.set(url, currentContent);
  }
}

function getPageContent() {
  const article = document.querySelector("article");
  return article ? article.getAttribute("data-test-key") || "" : "";
}

function showNotification() {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/iconActive.png",
    title: "gigradar",
    message: "Check new jobs!",
    priority: 2
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "startRefreshing") {
    startRefreshing(request.url, request.interval);
    sendResponse({ status: "refreshing started" });
  } else if (request.action === "stopRefreshing") {
    stopRefreshing();
    sendResponse({ status: "refreshing stopped" });
  }
});
