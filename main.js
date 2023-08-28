const funStatsBar = create('div', 'funstats-bar');

const historyLoadMenu = create('div', 'menu-top');
const historyLoadTextsResults = create('div', 'status-bar');

const checkbansMenu = create('div', 'menu-bottom');
const checkbansTextsResults = create('div', 'stats-results');
const checkbansPlayersList = create('div', 'banned-players-table');
const checkbansGlobalResults = create('div', 'stats-maps');

const checkBansButton = createSteamButton('Check loaded matches for bans');
checkBansButton.onclick = () => {
  checkLoadedMatchesForBans();
};

const stopCheckBansButton = createSteamButton('Stop');
toggleStopButton(stopCheckBansButton, false);
stopCheckBansButton.onclick = () => {
  stopCheckBan = true;
};

const loadMatchHistoryButton = createSteamButton('Load match history !');
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

const dateSinceHistoryInput = create('input', 'historyload-input-date');
dateSinceHistoryInput.setAttribute('type', 'text');

const dateSinceHistoryPlaceholder = create('div', 'historyload-input-date-suffix');
dateSinceHistoryPlaceholder.textContent = '(YYYY-MM-DD)';

const bancheckerSettingsButton = createSteamButton('Set API Key and options');
bancheckerSettingsButton.onclick = () => showSettings();

const historyLoadDescription = create('div', 'historyload-description');
historyLoadDescription.textContent = 'First, load your matchmaking history by choosing options and date : ';

const historyLoadOptions = create('div');
historyLoadOptions.classList = 'bancheck-flex-container';
historyLoadOptions.appendChild(historyLoadDescription);
historyLoadOptions.appendChild(bancheckerSettingsButton);

const historyLoadlabelDate = create('label');
historyLoadlabelDate.for = 'historyload-input-date';
historyLoadlabelDate.textContent = 'Load history since : ';

historyLoadMenu.appendChild(historyLoadOptions);
historyLoadMenu.appendChild(historyLoadlabelDate);
historyLoadMenu.appendChild(dateSinceHistoryInput);
historyLoadMenu.appendChild(dateSinceHistoryPlaceholder);
historyLoadMenu.appendChild(loadMatchHistoryButton);
historyLoadMenu.appendChild(stopLoadMatchHistoryButton);

const checkbansDescription = create('span', 'checkbans-description');
checkbansDescription.textContent = 'Then, check if there were banned players in loaded matches with this button :';

checkbansMenu.appendChild(create('br'));
checkbansMenu.appendChild(checkbansDescription);
checkbansMenu.appendChild(checkBansButton);
checkbansMenu.appendChild(stopCheckBansButton);

const optionsContainer = createOptionsContainer();

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

const extensionContainer = create('div', 'banchecker-menu');
extensionContainer.appendChild(optionsContainer);
if (!isCommendOrReportsSection()) {
  extensionContainer.appendChild(funStatsBar);
}
extensionContainer.appendChild(historyLoadMenu);
extensionContainer.appendChild(historyLoadTextsResults);
extensionContainer.appendChild(checkbansMenu);
extensionContainer.appendChild(checkbansTextsResults);
extensionContainer.appendChild(checkbansPlayersList);
extensionContainer.appendChild(checkbansGlobalResults);

if (document.querySelector('#subtabs')) {
  document.querySelector('#subtabs').insertAdjacentElement('afterend', extensionContainer);
}
