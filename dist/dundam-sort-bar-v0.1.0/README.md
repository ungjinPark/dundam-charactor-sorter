# Dundam Sort Bar

Dundam search result pages에 정렬 컨트롤을 추가하는 Chrome/Edge용 Manifest V3 확장프로그램입니다.

확장프로그램 아이콘을 누르면 popup 창에서 정렬 기능을 켜고 끌 수 있습니다.
설정은 `chrome.storage.local`에 저장되며 기본값은 켜짐입니다.

## 설치해서 테스트하기

### Chrome

1. `chrome://extensions`로 이동합니다.
2. 오른쪽 위의 개발자 모드를 켭니다.
3. 압축해제된 확장 프로그램 로드를 선택합니다.
4. 이 프로젝트 폴더를 선택합니다.
5. `https://dundam.xyz/search`로 시작하는 페이지에서 정렬 바가 보이는지 확인합니다.

### Edge

1. `edge://extensions`로 이동합니다.
2. 왼쪽의 개발자 모드를 켭니다.
3. 압축해제된 항목 로드를 선택합니다.
4. 이 프로젝트 폴더를 선택합니다.
5. `https://dundam.xyz/search`로 시작하는 페이지에서 정렬 바가 보이는지 확인합니다.

## 배포용 zip 만들기

```powershell
powershell -ExecutionPolicy Bypass -File scripts/package.ps1
```

생성 결과:

```text
dist/dundam-sort-bar-v0.1.0.zip
```

zip에는 `manifest.json`, `src/content.js`, `popup/*`, `icons/*`, `README.md`가 포함됩니다.

## 구조

```text
manifest.json
src/
  content.js
popup/
  popup.html
  popup.css
  popup.js
icons/
  dundam-16.png
  dundam-32.png
  dundam-64.png
  dundam-128.png
scripts/
  package.ps1
dist/
```

`src/content.js`는 `https://dundam.xyz/search*` 페이지에서만 content script로 실행됩니다.
content script가 로드되면 최대 15초 동안 100ms마다 검색 결과 DOM을 확인하고, 캐릭터 목록이 발견되면 정렬 DOM을 삽입합니다.
popup 스위치가 꺼져 있으면 정렬 DOM을 삽입하지 않습니다.
스위치를 끄면 이미 삽입된 정렬 DOM도 제거합니다.

직접 다시 삽입을 시도하려면 아래 함수를 호출하면 됩니다.

```js
window.dundamSortBar.mount();
```

사용 가능한 API:

```js
window.dundamSortBar.canMount(); // .search와 검색 결과 DOM이 준비됐는지 확인
window.dundamSortBar.mount(); // 스타일과 정렬 컨트롤 삽입
window.dundamSortBar.mountWhenReady(); // 최대 15초 동안 기다린 뒤 삽입
window.dundamSortBar.waitForCharacterList(); // 캐릭터 목록 등장 여부 Promise 반환
window.dundamSortBar.sort("attacker", "dsc"); // 현재 결과를 직접 정렬
```
