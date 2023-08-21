function is5v5CompetitiveSection() {
  return section === 'matchhistorycompetitive';
}

function isCommendOrReportsSection() {
  return ['playerreports', 'playercommends'].includes(section);
}

function saveHistoryDate() {
  let historyDate = document.getElementById('load-match-history-since').value.trim();
  // if date invalid we rollback to previous date
  if (historyDate && !isIsoDate(historyDate)) {
    historyDate = config.historyDate;
  }
  config.historyDate = historyDate;
  chrome.storage.sync.set({ historyDate: config.historyDate });
  updateFormValues();
}

function updateFormValues() {
  document.getElementById('yourapikey').value = config.yourapikey;
  if (is5v5CompetitiveSection()) {
    switch (config.gameType) {
      case 'long':
        document.getElementById('gameType-long').checked = true;
        break;
      case 'short':
        document.getElementById('gameType-short').checked = true;
        break;
      default:
        document.getElementById('gameType-all').checked = true;
        break;
    }
  }
  document.getElementById('load-match-history-since').value = config.historyDate;
}

function canContinue() {
  if (typeof content !== 'undefined') fetch = content.fetch; // fix for Firefox with disabled third-party cookies

  return !!profileURI && !!section;
}

function addFilterGameSelector(selector) {
  let editedSelector = selector;

  if (config.gameType === 'long') {
    editedSelector = `.${longGameClass} ${editedSelector}`;
  } else if (config.gameType === 'short') {
    editedSelector = `.${shortGameClass} ${editedSelector}`;
  }

  return editedSelector;
}

function getResultsNodeList() {
  let selector = '.csgo_scoreboard_root > tbody > tr';
  if (isCommendOrReportsSection()) {
    selector = `.${classChecked}`;
  }
  return document.querySelectorAll(selector);
}

function isIsoDate(str) {
  if (!isoDateRegex.test(str)) return false;
  const d = new Date(str);
  return d instanceof Date && !isNaN(d.getTime()) && d.toISOString().substring(0, 10) === str; // valid date
}

function getSteamID64(minProfileId) {
  return '76' + (parseInt(minProfileId, 10) + 561197960265728);
}

function parseTime(minutes, seconds) {
  let timeSecs = 0;
  timeSecs += parseInt(minutes, 10) * 60;
  timeSecs += parseInt(seconds, 10);
  return timeSecs;
}

function timeString(time) {
  let secs = time;
  const days = Math.floor(secs / (24 * 60 * 60));
  secs %= 86400;
  const hours = Math.floor(secs / (60 * 60))
    .toString()
    .padStart(2, '0');
  secs %= 3600;
  const mins = Math.floor(secs / 60)
    .toString()
    .padStart(2, '0');
  secs %= 60;
  secs = secs.toString().padStart(2, '0');

  let result = `${hours}:${mins}:${secs}`;
  if (days) result = `${days.toString()}d ${result}`;
  return result;
}

function updateTextContent(element, text, append) {
  if (!append) {
    element.textContent = '';
  }
  const format = (text, important, link) => {
    const textDiv = create('div');
    textDiv.textContent = text;
    if (important) {
      textDiv.classList.add('banchecker-red');
    }
    if (link) {
      textDiv.textContent = '';
      const linkElement = create('a');
      linkElement.target = '_blank';
      linkElement.href = link;
      linkElement.textContent = text;
      textDiv.appendChild(linkElement);
    }
    element.appendChild(textDiv);
  };
  if (text instanceof Array) {
    text.forEach((value) => format(value.text, value.important, value.link));
  } else {
    format(text, false, false);
  }
}

function create(tag, id) {
  const elt = document.createElement(tag);
  if (id) {
    elt.id = id;
  }
  return elt;
}

function getPourcentage(value, count) {
  return count ? Math.round((value / count) * 10000) / 100 : 0;
}

function showSettings() {
  optionsContainer.style.display = 'block';
}

function saveSettings() {
  const apiKey = document.getElementById('yourapikey').value;
  const apiKeySet = apiKey && !config.yourapikey;
  config.yourapikey = apiKey;
  let gamesFilterChanged = false;

  const configToSave = { yourapikey: config.yourapikey };
  if (is5v5CompetitiveSection()) {
    const gameType = document.getElementById('gameType-long').checked ? 'long' : document.getElementById('gameType-short').checked ? 'short' : 'all';
    gamesFilterChanged = gameType !== config.gameType;
    config.gameType = gameType;
    configToSave.gameType = config.gameType;
  }

  // save
  chrome.storage.sync.set(configToSave);

  if (config.yourapikey) {
    disableAllButtons(false);
    if (apiKeySet) {
      statsResults.textContent = '';
    }
  } else {
    updateResults([{ text: `You must set your API key first ! Don't worry, this is easy. Just click on the button "Set API Key and options" !`, important: true }]);
    disableAllButtons(true);
    bancheckerSettingsButton.disabled = false;
  }

  if (gamesFilterChanged) {
    disableAllButtons(true);
    updateResults([{ text: 'You need to reload the page if you changed games filter', important: true }]);
    statusBar.textContent = document.querySelector('.load_more_history_area').textContent = document.querySelector('.csgo_scoreboard_root').textContent = '';
  }

  updateFormValues();

  // close
  optionsContainer.style.display = 'none';
}

function createSteamButton(text) {
  const button = create('button');
  button.setAttribute('type', 'button');
  button.classList.add('btn-default');
  const textNode = document.createTextNode(text);
  button.appendChild(textNode);
  return button;
}

function disableAllButtons(value) {
  bancheckerSettingsButton.disabled = loadMatchHistoryButton.disabled = checkBansButton.disabled = value;
}

function updateResults(text, append) {
  updateTextContent(statsResults, text, append);
}

function updateStatus(text, append) {
  updateTextContent(statusBar, text, append);
}

function toggleStopButton(visible) {
  if (visible) {
    loadMatchHistoryStopButton.style.display = 'inline-block';
  } else {
    loadMatchHistoryStopButton.style.display = 'none';
  }
}

function createOptionsContainer() {
  const optionsContainer = create('div', 'banchecker-options');
  const inner = create('div');
  optionsContainer.appendChild(inner);

  const saveButton = create('button');
  saveButton.innerText = 'Save';
  saveButton.setAttribute('type', 'button');
  saveButton.onclick = () => saveSettings();

  const apiKeyInputLabel = create('span');
  apiKeyInputLabel.textContent = 'Your API key : ';
  const apiKeyInput = create('input', 'yourapikey');
  apiKeyInput.style.width = '300px';
  inner.appendChild(apiKeyInputLabel);
  inner.appendChild(apiKeyInput);

  inner.appendChild(create('br'));

  const linkForApiKey = create('a');
  linkForApiKey.target = '_blank';
  linkForApiKey.href = 'https://steamcommunity.com/dev/apikey';
  linkForApiKey.textContent = 'Get your API Key here';
  inner.appendChild(linkForApiKey);

  if (is5v5CompetitiveSection()) {
    inner.appendChild(create('br'));
    inner.appendChild(create('br'));

    const ignoreGamesLabel = create('span');
    ignoreGamesLabel.textContent = 'Filter games by type : ';
    inner.appendChild(ignoreGamesLabel);
    const ignoreGamesRadioAll = create('input');
    ignoreGamesRadioAll.type = 'radio';
    ignoreGamesRadioAll.name = 'gameType';
    ignoreGamesRadioAll.value = 'all';
    ignoreGamesRadioAll.id = 'gameType-all';
    ignoreGamesRadioAll.checked = true;
    const ignoreGamesRadioAllLabel = create('label');
    ignoreGamesRadioAllLabel.setAttribute('for', 'gameType-all');
    ignoreGamesRadioAllLabel.textContent = 'all games (no filter)';
    inner.appendChild(ignoreGamesRadioAll);
    inner.appendChild(ignoreGamesRadioAllLabel);
    const ignoreGamesRadioLong = create('input');
    ignoreGamesRadioLong.type = 'radio';
    ignoreGamesRadioLong.name = 'gameType';
    ignoreGamesRadioLong.value = 'long';
    ignoreGamesRadioLong.id = 'gameType-long';
    const ignoreGamesRadioLongLabel = create('label');
    ignoreGamesRadioLongLabel.setAttribute('for', 'gameType-long');
    ignoreGamesRadioLongLabel.textContent = 'long games only';
    inner.appendChild(ignoreGamesRadioLong);
    inner.appendChild(ignoreGamesRadioLongLabel);
    const ignoreGamesRadioShort = create('input');
    ignoreGamesRadioShort.type = 'radio';
    ignoreGamesRadioShort.name = 'gameType';
    ignoreGamesRadioShort.value = 'short';
    ignoreGamesRadioShort.id = 'gameType-short';
    const ignoreGamesRadioShortLabel = create('label');
    ignoreGamesRadioShortLabel.setAttribute('for', 'gameType-short');
    ignoreGamesRadioShortLabel.textContent = 'short games only';
    inner.appendChild(ignoreGamesRadioShort);
    inner.appendChild(ignoreGamesRadioShortLabel);
  }

  inner.appendChild(create('br'));
  inner.appendChild(create('br'));

  inner.appendChild(saveButton);

  return optionsContainer;
}

function updateUI() {
  formatMatchsTable();
  updateFunStats();
  updateGlobalStats();
}
