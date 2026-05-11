(() => {
  "use strict";

  const STYLE_ID = "sort-style";
  const CONTROL_ID = "sort-ctrl";
  const SEARCH_SELECTOR = ".search";
  const RESULT_SELECTOR = ".sr-result";
  const CHARACTER_SELECTOR = ".sr-result > .scon";
  const WAIT_TICK_MS = 100;
  const MAX_WAIT_TICKS = 150;
  const STORAGE_KEY = "dundamSortBarEnabled";
  const DEFAULT_ENABLED = true;

  const KOREAN_UNITS = [
    { label: "경", value: 10_000 ** 4 },
    { label: "조", value: 10_000 ** 3 },
    { label: "억", value: 10_000 ** 2 },
    { label: "만", value: 10_000 },
  ];

  /** @returns {HTMLElement[]} */
  const queryAll = (selector, bind = document) => [...bind.querySelectorAll(selector)];

  function parseKoreanNumber(text = "") {
    if (!text.trim()) return 0;

    const normalized = text.replace(/,/g, "").replace(/\s+/g, "");
    const isNegative = normalized.startsWith("-");
    let restText = normalized.replace(/^-/, "");
    let result = 0;

    for (const unit of KOREAN_UNITS) {
      const regex = new RegExp(`(\\d+)${unit.label}`);
      const match = restText.match(regex);

      if (match) {
        result += Number(match[1]) * unit.value;
        restText = restText.replace(match[0], "");
      }
    }

    if (/^\d+$/.test(restText)) {
      result += Number(restText);
    }

    return isNegative ? -result : result;
  }

  /** @param {HTMLElement} el */
  function getCharacterType(el) {
    const attackerInfo = el.querySelector(".stat_a");
    const bufferInfo = el.querySelector(".stat_b");

    if (attackerInfo) {
      return attackerInfo.querySelectorAll("li")?.length === 2 ? "attacker_synergy" : "attacker";
    }

    if (bufferInfo) {
      return bufferInfo.querySelectorAll("li:not(.off)").length === 3
        ? "buffer_enchantress"
        : "buffer";
    }

    return "unknown";
  }

  /** @param {HTMLElement} el */
  function getCharacterValue(el) {
    const charType = getCharacterType(el);
    const valueClass = charType.startsWith("attacker") ? ".stat_a" : ".stat_b";
    const values = queryAll(`${valueClass} li:not(.off) > .statc`, el);

    switch (charType) {
      case "attacker_synergy":
        return {
          party: parseKoreanNumber(values[0]?.querySelector(".val")?.textContent ?? ""),
          default: parseKoreanNumber(values[1]?.querySelector(".val")?.textContent ?? ""),
        };
      case "attacker":
        return {
          default: parseKoreanNumber(values[0]?.querySelector(".val")?.textContent ?? ""),
        };
      case "buffer_enchantress":
        return {
          favoritism: Number((values[0]?.querySelector(".val")?.textContent ?? "0").replace(/,/g, "")),
          threeMember: Number((values[1]?.querySelector(".val")?.textContent ?? "0").replace(/,/g, "")),
          default: Number((values[2]?.querySelector(".val")?.textContent ?? "0").replace(/,/g, "")),
        };
      case "buffer":
        return {
          default: Number((values[0]?.querySelector(".val")?.textContent ?? "0").replace(/,/g, "")),
        };
      default:
        return {
          default: 0,
        };
    }
  }

  /** @param {HTMLElement[]} list */
  function createCharacterList(list) {
    return list.map((node) => ({
      name: node.querySelector(".name")?.childNodes[0]?.textContent?.trim() ?? "",
      type: getCharacterType(node),
      info: getCharacterValue(node),
      node,
    }));
  }

  function sortCharList(charType, valueOrder) {
    const resultContainer = document.querySelector(RESULT_SELECTOR);
    if (!resultContainer) return;

    const charList = createCharacterList(queryAll(CHARACTER_SELECTOR));
    const sorted = charList.sort((a, b) => {
      const aIsBuffer = a.type.startsWith("buffer");
      const bIsBuffer = b.type.startsWith("buffer");
      const aValue = a.info.default;
      const bValue = b.info.default;

      if (aIsBuffer !== bIsBuffer) {
        switch (charType) {
          case "buffer":
            return aIsBuffer ? -1 : 1;
          case "attacker":
            return !aIsBuffer ? -1 : 1;
          default:
            return 0;
        }
      }

      switch (valueOrder) {
        case "dsc":
          return bValue - aValue;
        case "asc":
          return aValue - bValue;
        default:
          return 0;
      }
    });

    resultContainer.append(...sorted.map((character) => character.node));
  }

  function injectStyle() {
    if (document.head.querySelector(`#${STYLE_ID}`)) return;

    const sortStyle = document.createElement("style");
    sortStyle.id = STYLE_ID;
    sortStyle.textContent = `
      .sort {
        display: flex;
        margin: 1em 0;
        padding: 0.5em;
        gap: 1em;
        justify-content: flex-end;
      }

      .sort label:has(select) {
        display: flex;
        gap: 0.5em;
        align-items: center;
        justify-content: center;
      }

      .sort select {
        padding: 0.5em;
        border-radius: 0.25em;
      }

      .sort button {
        background-color: #5988d9;
        padding: 0.5em;
        color: white;
        appearance: none;
        border: none;
        border-radius: 0.5em;
      }

      .sort button:active {
        filter: brightness(1.2);
      }
    `;

    document.head.append(sortStyle);
  }

  function injectControls() {
    if (document.querySelector(`#${CONTROL_ID}`)) return;

    const searchContainer = document.querySelector(SEARCH_SELECTOR);
    if (!searchContainer) return;

    const sortDiv = document.createElement("div");
    sortDiv.className = "sort";
    sortDiv.id = CONTROL_ID;
    sortDiv.innerHTML = `
      <label for="sort_priority_chartype">
        <b>캐릭터 우선 정렬:</b>
        <select id="sort_priority_chartype">
          <option value="attacker" selected>딜러 우선 정렬</option>
          <option value="buffer">버퍼 우선 정렬</option>
        </select>
      </label>
      <label for="sort_priority_value">
        <b>데미지/버프력 정렬:</b>
        <select id="sort_priority_value">
          <option value="dsc" selected>내림차순</option>
          <option value="asc">오름차순</option>
        </select>
      </label>
      <button id="sort_apply" type="button">적용</button>
    `;

    searchContainer.insertAdjacentElement("afterend", sortDiv);

    const sortOptionsValue = sortDiv.querySelector("#sort_priority_value");
    const sortOptionsCharType = sortDiv.querySelector("#sort_priority_chartype");
    const sortApply = sortDiv.querySelector("#sort_apply");

    sortApply.addEventListener("click", () => {
      sortCharList(sortOptionsCharType.value, sortOptionsValue.value);
    });

    sortCharList(sortOptionsCharType.value, sortOptionsValue.value);
  }

  function canInitialize() {
    return Boolean(
      document.head
      && document.querySelector(SEARCH_SELECTOR)
      && document.querySelector(CHARACTER_SELECTOR)
    );
  }

  function mount() {
    if (!canInitialize()) return false;

    injectStyle();
    injectControls();
    return true;
  }

  function unmount() {
    document.querySelector(`#${CONTROL_ID}`)?.remove();
    document.head?.querySelector(`#${STYLE_ID}`)?.remove();
    return true;
  }

  function getEnabled() {
    return new Promise((resolve) => {
      if (!globalThis.chrome?.storage?.local) {
        resolve(DEFAULT_ENABLED);
        return;
      }

      chrome.storage.local.get({ [STORAGE_KEY]: DEFAULT_ENABLED }, (items) => {
        resolve(Boolean(items[STORAGE_KEY]));
      });
    });
  }

  function waitForCharacterList(maxTicks = MAX_WAIT_TICKS, tickMs = WAIT_TICK_MS) {
    return new Promise((resolve) => {
      let ticks = 0;

      const timer = window.setInterval(() => {
        if (document.querySelectorAll(CHARACTER_SELECTOR).length > 0) {
          window.clearInterval(timer);
          resolve(true);
          return;
        }

        ticks += 1;

        if (ticks >= maxTicks) {
          window.clearInterval(timer);
          resolve(false);
        }
      }, tickMs);
    });
  }

  async function mountWhenReady() {
    if (!(await getEnabled())) return false;

    const ready = await waitForCharacterList();

    if (!ready) {
      console.warn("[Dundam Sort Bar] Search results were not found within 15s.");
      return false;
    }

    if (!(await getEnabled())) return false;

    return mount();
  }

  function watchEnabledChanges() {
    if (!globalThis.chrome?.storage?.onChanged) return;

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "local" || !changes[STORAGE_KEY]) return;

      if (changes[STORAGE_KEY].newValue === false) {
        unmount();
        return;
      }

      mountWhenReady();
    });
  }

  window.dundamSortBar = {
    mount,
    unmount,
    mountWhenReady,
    canMount: canInitialize,
    waitForCharacterList,
    sort: sortCharList,
  };

  watchEnabledChanges();
  mountWhenReady();
})();
