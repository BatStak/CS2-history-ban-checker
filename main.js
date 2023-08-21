const extensionContainer = create('div', 'banchecker-menu');

const statusBar = create('div', 'status-bar');
const funStatsBar = create('div', 'funstats-bar');
const menuTop = create('div', 'menu-top');
const menuBottom = create('div', 'menu-bottom');
const statsResults = create('div', 'stats-results');
const statsMaps = create('div', 'stats-maps');

if (!isCommendOrReportsSection()) {
  extensionContainer.appendChild(funStatsBar);
}
extensionContainer.appendChild(menuTop);
extensionContainer.appendChild(statusBar);
extensionContainer.appendChild(menuBottom);
extensionContainer.appendChild(statsResults);
extensionContainer.appendChild(statsMaps);

document.querySelector('#subtabs').insertAdjacentElement('afterend', extensionContainer);

const checkBansButton = createSteamButton('Check loaded matches for bans');
checkBansButton.onclick = () => {
  checkLoadedMatchesForBans();
};

const loadMatchHistoryButton = createSteamButton('Load match history since');
loadMatchHistoryButton.onclick = () => {
  loadMatchHisory();
};

const loadMatchHistoryStopButton = createSteamButton('Stop');
toggleStopButton(false);
loadMatchHistoryStopButton.onclick = () => {
  if (timerLoadMatchHistory) {
    clearInterval(timerLoadMatchHistory);
    timerLoadMatchHistory = null;
  }
  disableAllButtons(false);
  toggleStopButton(false);
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
menuTop.appendChild(loadMatchHistoryStopButton);
menuBottom.appendChild(checkBansButton);

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
