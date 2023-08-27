const extensionContainer = create('div', 'banchecker-menu');

const statusBar = create('div', 'status-bar');
const funStatsBar = create('div', 'funstats-bar');
const menuTop = create('div', 'menu-top');
const menuBottom = create('div', 'menu-bottom');
const statsResults = create('div', 'stats-results');
const bannedPlayersTable = create('div', 'banned-players-table');
const statsMaps = create('div', 'stats-maps');

if (!isCommendOrReportsSection()) {
  extensionContainer.appendChild(funStatsBar);
}
extensionContainer.appendChild(menuTop);
extensionContainer.appendChild(statusBar);
extensionContainer.appendChild(menuBottom);
extensionContainer.appendChild(statsResults);
extensionContainer.appendChild(bannedPlayersTable);
extensionContainer.appendChild(statsMaps);

if (document.querySelector('#subtabs')) {
  document.querySelector('#subtabs').insertAdjacentElement('afterend', extensionContainer);
}

const checkBansButton = createSteamButton('Check loaded matches for bans');
checkBansButton.onclick = () => {
  checkLoadedMatchesForBans();
};

const stopCheckBansButton = createSteamButton('Stop');
toggleStopButton(stopCheckBansButton, false);
stopCheckBansButton.onclick = () => {
  stopCheckBan = true;
};

const loadMatchHistoryButton = createSteamButton('Load match history since');
loadMatchHistoryButton.onclick = () => {
  loadMatchHistory();
};

const stopLoadMatchHistoryButton = createSteamButton('Stop');
toggleStopButton(stopLoadMatchHistoryButton, false);
stopLoadMatchHistoryButton.onclick = () => {
  stopTimerLoadMatchHistory();
  disableAllButtons(false);
  toggleStopButton(stopLoadMatchHistoryButton, false);
};

const dateSinceHistoryInput = create('input');
dateSinceHistoryInput.setAttribute('type', 'text');
dateSinceHistoryInput.setAttribute('id', 'load-match-history-since');
dateSinceHistoryInput.style.width = '100px';

const dateSinceHistoryPlaceholder = create('div');
dateSinceHistoryPlaceholder.style.display = 'inline-block';
dateSinceHistoryPlaceholder.style.margin = '0 10px';
dateSinceHistoryPlaceholder.textContent = '(YYYY-MM-DD)';

const bancheckerSettingsButton = createSteamButton('Set API Key and options');
bancheckerSettingsButton.onclick = () => showSettings();

menuTop.appendChild(bancheckerSettingsButton);
menuTop.appendChild(loadMatchHistoryButton);
menuTop.appendChild(dateSinceHistoryInput);
menuTop.appendChild(dateSinceHistoryPlaceholder);
menuTop.appendChild(stopLoadMatchHistoryButton);
menuBottom.appendChild(checkBansButton);
menuBottom.appendChild(stopCheckBansButton);

const optionsContainer = createOptionsContainer();
extensionContainer.appendChild(optionsContainer);

chrome.storage.sync.get(['yourapikey', 'gameType', 'historyDate'], (storageData) => {
  if (storageData.yourapikey) {
    config.yourapikey = storageData.yourapikey;
  }
  if (storageData.gameType) {
    config.gameType = storageData.gameType;
  }
  if (storageData.historyDate === undefined) {
    const date = new Date();
    date.setDate(date.getDate() - 500);
    config.historyDate = `${date.getFullYear()}-${date.getMonth() < 10 ? '0' : ''}${date.getMonth()}-${date.getDate() < 10 ? '0' : ''}${date.getDate()}`;
    chrome.storage.sync.set({ historyDate: config.historyDate });
  } else {
    config.historyDate = storageData.historyDate;
  }

  init();
});

const loadMoreButton = document.querySelector('.load_more_history_area #load_more_clickable');
if (loadMoreButton) {
  const observer = new MutationObserver((mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.attributeName === 'style') {
        if (loadMoreButton.style.display !== 'none') {
          updateUI();
        }
      }
    }
  });
  observer.observe(loadMoreButton, { attributes: true });
}

const subpage_container = document.querySelector('#subpage_container');
if (subpage_container) {
  const observer = new MutationObserver((mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.attributeName === 'class' && mutation.target.classList.contains('friends_content') && !mutation.target.classList.contains('loading')) {
        checkPeople();
      }
    }
  });
  observer.observe(subpage_container, { attributes: true });
}

let mutationCount = 0;
const group_page_dynamic_content = document.querySelector('#group_page_dynamic_content');
if (group_page_dynamic_content) {
  const observer = new MutationObserver((mutationList, observer) => {
    for (const mutation of mutationList) {
      mutationCount++;
      if (mutationCount % 2) {
        checkGroupMembers();
      }
    }
  });
  observer.observe(group_page_dynamic_content, { childList: true });
}
