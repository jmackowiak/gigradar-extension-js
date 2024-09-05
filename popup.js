document.addEventListener("DOMContentLoaded", function () {
  const urlInput = document.getElementById("url");
  const timeInput = document.getElementById("time");
  const statusMessage = document.getElementById("status");

  loadStoredValues();

  document.getElementById("submit").addEventListener("click", function () {
    const url = urlInput.value;
    const time = parseInt(timeInput.value, 10);

    if (url && time) {
      saveValues(url, time);
      checkIfTabIsOpen(url);
      startRefreshing(url, time);
    }
  });

  document.getElementById("clear").addEventListener("click", function () {
    clearForm();
  });

  function loadStoredValues() {
    const savedUrl = localStorage.getItem("url");
    const savedTime = localStorage.getItem("time");

    if (savedUrl) {
      urlInput.value = savedUrl;
    }

    if (savedTime) {
      timeInput.value = savedTime;
    }
  }

  function saveValues(url, time) {
    localStorage.setItem("url", url);
    localStorage.setItem("time", time);
    console.log(`URL: ${url}`);
    console.log(`Time: ${time} seconds`);
  }

  function startRefreshing(url, time) {
    chrome.runtime.sendMessage(
      { action: "startRefreshing", url: url, interval: time },
      function (response) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          console.log(response.status);
        }
      }
    );
  }

  function clearForm() {
    urlInput.value = "";
    timeInput.value = "";
    localStorage.removeItem("url");
    localStorage.removeItem("time");
    statusMessage.textContent = "";
    stopRefreshing();
    console.log("form and localStorage cleared");
  }

  function stopRefreshing() {
    chrome.runtime.sendMessage(
      { action: "stopRefreshing" },
      function (response) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          console.log(response.status);
        }
      }
    );
  }

  function checkIfTabIsOpen(url) {
    chrome.tabs.query({}, function (tabs) {
      const urlToCheck = new URL(url).href;
      const tabFound = tabs.some((tab) => new URL(tab.url).href === urlToCheck);

      if (tabFound) {
        statusMessage.textContent = "Perfect, gigradar is working!";
      } else {
        statusMessage.textContent = "Open submitted url in any tab.";
      }
    });
  }
});
