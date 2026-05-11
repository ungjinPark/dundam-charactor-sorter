(() => {
  "use strict";

  const STORAGE_KEY = "dundamSortBarEnabled";
  const DEFAULT_ENABLED = true;

  const enabledSwitch = document.querySelector("#enabledSwitch");
  const statusText = document.querySelector("#statusText");

  function setStatus(enabled) {
    statusText.textContent = enabled ? "정렬 기능 켜짐" : "정렬 기능 꺼짐";
  }

  chrome.storage.local.get({ [STORAGE_KEY]: DEFAULT_ENABLED }, (items) => {
    const enabled = Boolean(items[STORAGE_KEY]);
    enabledSwitch.checked = enabled;
    setStatus(enabled);
  });

  enabledSwitch.addEventListener("change", () => {
    const enabled = enabledSwitch.checked;

    chrome.storage.local.set({ [STORAGE_KEY]: enabled }, () => {
      setStatus(enabled);

      if (!enabled) {
        window.alert("정렬 기능을 껐습니다. 이미 열린 Dundam 검색 페이지에는 새로고침 후 상태가 완전히 반영됩니다.");
      }
    });
  });
})();
