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
  updateMapStats();
}
