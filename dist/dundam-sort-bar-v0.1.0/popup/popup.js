(() => {
  "use strict";

  const STORAGE_KEY = "dundamSortBarEnabled";
  const DEFAULT_ENABLED = true;

  const enabledSwitch = document.querySelector("#enabledSwitch");
  const statusText = document.querySelector("#statusText");

  function setStatus(enabled) {
    statusText.textContent = enabled ? "Enabled" : "Disabled";
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
    });
  });
})();
