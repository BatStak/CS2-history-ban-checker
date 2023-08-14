const maxRetries = 3;

const banStats = {
  vacBans: 0,
  gameBans: 0,
  recentBans: 0,
};

const funStats = {
  numberOfMatches: 0,
  totalKills: 0,
  totalAssists: 0,
  totalDeaths: 0,
  totalWins: 0,
  totalWaitTime: 0,
  totalTime: 0,
  wins: 0,
  loses: 0,
  draws: 0,
};

const config = {
  yourapikey: '',
  ignoreBansBefore: 5 * 365,
  gameType: 'all',
  ignoreRecentPeriodWithNoBanAfterTheMatch: false,
  historyDate: undefined,
};

chrome.storage.sync.get(['yourapikey', 'gameType', 'ignoreBansBefore', 'historyDate'], (storageData) => {
  if (storageData.yourapikey) {
    config.yourapikey = storageData.yourapikey;
  }
  if (storageData.ignoreBansBefore || storageData.ignoreBansBefore === 0) {
    config.ignoreBansBefore = storageData.ignoreBansBefore;
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

let profileURI = null;
let section = new URLSearchParams(window.location.search).get('tab');

const waitTimeRegex = /Wait Time\: (\d+)\:(\d+)/;
const matchTimeRegex = /Match Duration\: (\d+)\:(\d+)/;
const scoreRegex = /(\d+) : (\d+)/;
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

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

function updateResults(text, append) {
  updateTextContent(statsResults, text, append);
}

function updateStatus(text, append) {
  updateTextContent(statusBar, text, append);
}

function canContinue() {
  if (typeof content !== 'undefined') fetch = content.fetch; // fix for Firefox with disabled third-party cookies

  profileURI = document.querySelector('.profile_small_header_texture > a')?.href;

  return !!profileURI && !!section;
}

function updateFunStats() {
  if (isCommendOrReportsSection()) return;

  let filterGame = false;

  // we find the links on our profil to get the statistics of the match
  const myProfileLinks = document.querySelectorAll(`.inner_name .playerAvatar a[href="${profileURI}"]:not(.personal-stats-checked)`);
  for (let link of myProfileLinks) {
    const playerRow = link.closest('tr');
    const matchRow = playerRow.closest('table').parentNode.parentNode;
    const score = playerRow.parentNode.querySelector('.csgo_scoreboard_score').innerText.match(scoreRegex);
    const rowsCount = playerRow.parentNode.children.length;
    const playerIndex = Array.from(playerRow.parentNode.children).indexOf(playerRow);
    const scoreTeam1 = parseInt(score[1], 10);
    const scoreTeam2 = parseInt(score[2], 10);
    const isFirstTeamWin = scoreTeam1 > scoreTeam2;
    const isPlayerInFirstTeam = playerIndex < Math.floor(rowsCount / 2);

    if (is5v5CompetitiveSection()) {
      // add class "short" or "long" game
      const maxScore = Math.max(scoreTeam1, scoreTeam2);
      const isLong = maxScore === 15 || maxScore === 16;
      const isShort = maxScore === 8 || maxScore === 9;
      const isAborted = !isLong && !isShort;
      if (isLong) {
        matchRow.classList.add('long-game');
      } else if (isShort) {
        matchRow.classList.add('short-game');
      } else if (isAborted) {
        matchRow.classList.add('aborted-game');
      }

      filterGame = (config.gameType === 'long' && !isLong) || (config.gameType === 'short' && !isShort);
    }

    if (!filterGame) {
      const myMatchStats = playerRow.querySelectorAll('td');
      funStats.totalKills += parseInt(myMatchStats[2].innerText, 10);
      funStats.totalAssists += parseInt(myMatchStats[3].innerText, 10);
      funStats.totalDeaths += parseInt(myMatchStats[4].innerText, 10);
      if (score[1] === score[2]) {
        funStats.draws++;
      } else if (isPlayerInFirstTeam === isFirstTeamWin) {
        funStats.wins++;
      } else {
        funStats.loses++;
      }

      const leftPanel = matchRow.querySelector('.val_left');
      for (let td of leftPanel.querySelectorAll('td')) {
        const innerText = td.innerText.trim();
        if (waitTimeRegex.test(innerText)) {
          const hoursAndMinues = innerText.match(waitTimeRegex);
          funStats.totalWaitTime += parseTime(hoursAndMinues[1], hoursAndMinues[2]);
        } else if (matchTimeRegex.test(innerText)) {
          const hoursAndMinues = innerText.match(matchTimeRegex);
          funStats.totalTime += parseTime(hoursAndMinues[1], hoursAndMinues[2]);
        }
      }

      funStats.numberOfMatches++;
    }

    link.classList.add('personal-stats-checked');
  }

  funStatsBar.textContent = `Some fun stats for loaded matches:
Number of matches: ${funStats.numberOfMatches}
Total kills: ${funStats.totalKills}
Total assists: ${funStats.totalAssists}
Total deaths: ${funStats.totalDeaths}
K/D: ${funStats.totalDeaths ? (funStats.totalKills / funStats.totalDeaths).toFixed(3) : 0}
(K+A)/D: ${funStats.totalDeaths ? ((funStats.totalKills + funStats.totalAssists) / funStats.totalDeaths).toFixed(3) : 0}
Total wait time: ${timeString(funStats.totalWaitTime)}
Total match time: ${timeString(funStats.totalTime)}
Wins: ${funStats.wins}
Draws: ${funStats.draws}
Loses: ${funStats.loses}
Winrate: ${getPourcentage(funStats.wins, funStats.numberOfMatches)} %
Winrate with draws: ${getPourcentage(funStats.wins + funStats.draws, funStats.numberOfMatches)} %
Loserate: ${getPourcentage(funStats.loses, funStats.numberOfMatches)} %`;
}

function formatMatchsTable() {
  const daysSince = (dateString) => {
    const matchDate = dateString.match(/(20\d\d)-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)/);
    let daysSinceMatch = -1;
    if (matchDate.length > 6) {
      const year = parseInt(matchDate[1], 10);
      const month = parseInt(matchDate[2], 10) - 1;
      const day = parseInt(matchDate[3], 10);
      const hour = parseInt(matchDate[4], 10);
      const minute = parseInt(matchDate[5], 10);
      const second = parseInt(matchDate[6], 10);
      const matchDateObj = new Date(year, month, day, hour, minute, second);
      const matchDayTime = matchDateObj.getTime();
      const currentTime = Date.now();
      const timePassed = currentTime - matchDayTime;
      daysSinceMatch = Math.ceil(timePassed / (1000 * 60 * 60 * 24));
    }
    return daysSinceMatch;
  };
  if (isCommendOrReportsSection()) {
    for (let report of document.querySelectorAll('.generic_kv_table > tbody > tr:not(:first-child):not(.banchecker-profile)')) {
      const dateEl = report.querySelector('td:first-child');
      const daysSinceMatch = daysSince(dateEl.innerText);
      const minProfileId = report.querySelector('.linkTitle').dataset.miniprofile;
      report.dataset.steamid64 = getSteamID64(minProfileId);
      report.dataset.dayssince = daysSinceMatch;
      report.classList.add('banchecker-profile');
      report.classList.add('banchecker-formatted');
    }
  } else {
    for (let table of document.querySelectorAll('.csgo_scoreboard_inner_right:not(.banchecker-formatted)')) {
      const leftColumn = table.parentElement.parentElement.querySelector('.csgo_scoreboard_inner_left');
      const daysSinceMatch = daysSince(leftColumn.innerText);
      table.querySelectorAll('tbody > tr').forEach((tr, i) => {
        if (i === 0 || tr.childElementCount < 3) return;
        const profileLink = tr.querySelector('.linkTitle');
        const minProfileId = profileLink.dataset.miniprofile;
        const steamid64 = getSteamID64(minProfileId);
        tr.dataset.steamid64 = steamid64;
        tr.dataset.dayssince = daysSinceMatch;
        tr.classList.add('banchecker-profile');
      });
      table.classList.add('banchecker-formatted');
    }
  }
  addBanColumns();
}

function checkBans(players) {
  const uniquePlayers = [...new Set(players)];
  let batches = uniquePlayers.reduce((arr, player, i) => {
    const batchIndex = Math.floor(i / 100);
    if (!arr[batchIndex]) {
      arr[batchIndex] = [player];
    } else {
      arr[batchIndex].push(player);
    }
    return arr;
  }, []);
  const checkBansOnApi = (i, retryCount) => {
    updateResults([
      { text: `Loaded unchecked matches contain ${uniquePlayers.length} players.` },
      { text: `We can scan 100 players at a time so we're sending ${batches.length} request${batches.length > 1 ? 's' : ''}` },
      { text: `${i} successful request${i === 1 ? '' : 's'} so far...` },
    ]);

    chrome.runtime.sendMessage(
      chrome.runtime.id,
      {
        action: 'fetchBans',
        apikey: config.yourapikey,
        batch: batches[i],
      },
      (json, error) => {
        if (error || !json) {
          updateResults(
            [
              {
                text: `Error while scanning players for bans: ${
                  retryCount > 0
                    ? `Retrying to scan... ${maxRetries - retryCount + 1}/3`
                    : `Couldn't scan for bans after ${maxRetries} retries. Are your sure you set a valid API key ?`
                }`,
                important: true,
              },
            ],
            true
          );
          if (retryCount > 0) {
            setTimeout(() => checkBansOnApi(i, retryCount - 1), 3000);
          }
          return;
        }
        for (let player of json.players) {
          const playerEls = document.querySelectorAll(`tr[data-steamid64="${player.SteamId}"]`);
          const daySinceLastMatch = parseInt(playerEls[0].dataset.dayssince, 10);
          let verdict = '';
          if (player.NumberOfVACBans > 0) {
            verdict += 'VAC';
            banStats.vacBans++;
          }
          if (player.NumberOfGameBans > 0) {
            if (verdict) verdict += ' &\n';
            verdict += 'Game';
            banStats.gameBans++;
          }
          if (verdict) {
            const daysAfter = daySinceLastMatch - player.DaysSinceLastBan;
            if (daySinceLastMatch > player.DaysSinceLastBan) {
              banStats.recentBans++;
              verdict += '+' + daysAfter;
            } else {
              verdict += daysAfter;
            }
          }
          for (let playerEl of playerEls) {
            playerEl.classList.add('banchecker-checked');
            verdictEl = playerEl.querySelector('.banchecker-bans');
            if (verdict) {
              if (daySinceLastMatch > player.DaysSinceLastBan) {
                verdictEl.style.color = 'red';
                if (!isCommendOrReportsSection()) {
                  playerEl.parentNode.parentNode.parentNode.parentNode.style.backgroundColor = '#583a3a';
                }
              } else {
                if (config.ignoreBansBefore && config.ignoreBansBefore > 0 && player.DaysSinceLastBan > config.ignoreBansBefore) {
                  verdictEl.style.color = 'grey';
                  playerEl.classList.add('banchecker-old');
                } else {
                  verdictEl.style.color = 'yellow';
                }
              }
              verdictEl.style.cursor = 'help';
              verdictEl.innerText = verdict;
              verdictEl.title = `Days since last ban: ${player.DaysSinceLastBan}`;
            } else {
              verdictEl.innerText = '';
            }
          }
        }
        if (batches.length > i + 1) {
          setTimeout(() => checkBansOnApi(i + 1, maxRetries), 1000);
        } else {
          updateResults([
            { text: `Looks like we're done.` },
            { text: '' },
            { text: `There were ${banStats.recentBans} players who got banned after playing with you!`, important: banStats.recentBans > 0 },
            { text: '' },
            {
              text: `Total ban stats: ${banStats.vacBans} VAC banned and ${banStats.gameBans} Game banned players in games we scanned (a lot of these could happen outside of CS:GO.)`,
            },
          ]);
          banstats();
        }
      }
    );
  };
  if (uniquePlayers.length > 0) {
    checkBansOnApi(0, maxRetries);
  } else {
    disableAllButtons(false);
  }
}

function disableAllButtons(value) {
  bancheckerSettingsButton.disabled = loadMatchHistoryButton.disabled = checkBansButton.disabled = value;
}

function isCommendOrReportsSection() {
  return ['playerreports', 'playercommends'].includes(section);
}

function addBanColumns() {
  if (isCommendOrReportsSection()) {
    const tableHeader = document.querySelector('.generic_kv_table > tbody > tr:first-child');
    if (!tableHeader.classList.contains('ban-column-added')) {
      tableHeader.classList.add('ban-column-added');
      const bansHeader = create('th');
      bansHeader.innerText = 'Ban';
      tableHeader.appendChild(bansHeader);
    }
    for (let tr of document.querySelectorAll('.generic_kv_table > tbody > tr:not(.ban-column-added)')) {
      tr.classList.add('ban-column-added');
      const bansPlaceholder = create('td');
      bansPlaceholder.classList.add('banchecker-bans');
      bansPlaceholder.innerText = '?';
      tr.appendChild(bansPlaceholder);
    }
  } else {
    for (let table of document.querySelectorAll('.banchecker-formatted:not(.ban-column-added)')) {
      table.classList.add('ban-column-added');
      table.querySelectorAll('tr').forEach((tr, i) => {
        if (i === 0) {
          const bansHeader = create('th');
          bansHeader.innerText = 'Bans';
          bansHeader.style.minWidth = '5.6em';
          tr.appendChild(bansHeader);
        } else if (tr.childElementCount > 3) {
          const bansPlaceholder = create('td');
          bansPlaceholder.classList.add('banchecker-bans');
          bansPlaceholder.innerText = '?';
          tr.appendChild(bansPlaceholder);
        } else {
          const scoreboard = tr.querySelector('td');
          if (scoreboard) scoreboard.setAttribute('colspan', '9');
        }
      });
    }
  }
}

function checkLoadedMatchesForBans() {
  disableAllButtons(true);
  let selector = '.banchecker-profile:not(.banchecker-checked):not(.banchecker-checking)';
  if (is5v5CompetitiveSection()) {
    if (config.gameType === 'long') {
      selector = '.long-game ' + selector;
    } else if (config.gameType === 'short') {
      selector = '.short-game ' + selector;
    }
  }
  let playersArr = [];
  for (let player of document.querySelectorAll(selector)) {
    player.classList.add('banchecker-checking');
    playersArr.push(player.dataset.steamid64);
  }
  checkBans(playersArr);
}

function createSteamButton(text) {
  const button = create('button');
  button.setAttribute('type', 'button');
  button.classList.add('btn-default');
  const textNode = document.createTextNode(text);
  button.appendChild(textNode);
  return button;
}

function getResultsNodeList(nofilter) {
  let selector = '.csgo_scoreboard_root > tbody > tr';
  if (is5v5CompetitiveSection() && !nofilter) {
    if (config.gameType === 'long') {
      selector += '.long-game';
    } else if (config.gameType === 'short') {
      selector += '.short-game';
    }
  }
  if (isCommendOrReportsSection()) {
    selector = '.banchecker-profile';
  }
  return document.querySelectorAll(selector);
}

function toggleStopButton(visible) {
  if (visible) {
    loadMatchHistoryStopButton.style.display = 'inline-block';
  } else {
    loadMatchHistoryStopButton.style.display = 'none';
  }
}

function is5v5CompetitiveSection() {
  return section === 'matchhistorycompetitive';
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

let timerLoadMatchHistory = null;
async function loadMatchHisory() {
  saveHistoryDate();
  toggleStopButton(true);
  disableAllButtons(true);
  let status = '';
  if (config.historyDate) {
    status = `Loading match history since ${config.historyDate} !`;
  } else {
    status = `Loading all match history !`;
  }
  updateStatus(status);
  await new Promise((resolve) => {
    let numberOfMatches = 0;
    let attemptsToLoadMoreMatches = 0;
    const moreButton = document.getElementById('load_more_button');
    if (moreButton) {
      timerLoadMatchHistory = setInterval(() => {
        if (moreButton.offsetParent !== null) {
          const newNumberOfMatches = getResultsNodeList(true).length;
          if (newNumberOfMatches === numberOfMatches) {
            if (attemptsToLoadMoreMatches < 3) {
              attemptsToLoadMoreMatches++;
            } else {
              clearInterval(timerLoadMatchHistory);
              resolve();
            }
          }

          if (newNumberOfMatches !== numberOfMatches || attemptsToLoadMoreMatches < 3) {
            const lastDate = document.getElementById('load_more_button_continue_text').innerText.trim();
            updateStatus(`${status} ... [${lastDate}]`);
            if (config.historyDate && config.historyDate >= lastDate) {
              clearInterval(timerLoadMatchHistory);
              resolve();
            } else {
              numberOfMatches = newNumberOfMatches;
              moreButton.click();
            }
          }
        }
      }, 800);
    } else {
      resolve();
    }
  });
  updateStatus(`${status} Done !`);
  disableAllButtons(false);
  toggleStopButton(false);
}

function showSettings() {
  optionsContainer.style.display = 'block';
}

function getPourcentage(value, count) {
  return count ? Math.round((value / count) * 10000) / 100 : 0;
}

function saveSettings() {
  const apiKey = document.getElementById('yourapikey').value;
  const apiKeySet = apiKey && !config.yourapikey;
  config.yourapikey = apiKey;
  let gamesFilterChanged = false;
  const ignoreBansBefore = document.getElementById('ignoreBansBefore').value;
  if (!isNaN(ignoreBansBefore) && parseInt(ignoreBansBefore, 10) >= 0) {
    config.ignoreBansBefore = parseInt(ignoreBansBefore, 10);
  }

  const configToSave = { yourapikey: config.yourapikey, ignoreBansBefore: config.ignoreBansBefore };
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

  inner.appendChild(create('br'));
  inner.appendChild(create('br'));

  const oldBanInputLabel = create('span');
  oldBanInputLabel.textContent = 'Ignore bans which occured before the games older than (in days) : ';
  const oldBanInput = create('input', 'ignoreBansBefore');
  oldBanInput.type = 'number';
  oldBanInput.style.width = '60px';
  oldBanInput.value = 0;
  inner.appendChild(oldBanInputLabel);
  inner.appendChild(oldBanInput);

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

async function banstats() {
  const playersWithOldBan = new Set([...document.querySelectorAll('.banchecker-old')].map((e) => e.dataset.steamid64)).size;
  const players = [];
  const playersBanned = [];
  const playersBannedAfter = [];

  let matchesCount = 0;
  let matchesCountWithPlayerBanned = 0;
  let matchesCountWithPlayerBannedAfter = 0;

  let startDate = '';
  let endDate = '';

  let domMatchesParts = [...getResultsNodeList()];

  // for each match
  for (let domPart of domMatchesParts) {
    const playerRows = domPart.querySelectorAll('tr[data-steamid64]:not(.banchecker-old)');

    // guard but impossible
    if (playerRows.length > 0) {
      let matchHasPlayerBanned = false;
      let matchHasPlayerBannedAfter = false;
      const playersOfTheMatchWeDontKnowYet = [];

      //  for each player
      for (let player of playerRows) {
        const steamId = player.attributes['data-steamid64'].value;
        const banStatus = player.querySelector('.banchecker-bans');

        // we store players we don't know yet
        if (!players.some((p) => p === steamId)) {
          playersOfTheMatchWeDontKnowYet.push(steamId);
        }

        // we have a ban
        const banLabel = banStatus.innerText.trim();
        if (banLabel != '') {
          if (!playersBanned.some((p) => p === steamId)) {
            playersBanned.push(steamId);
          }

          matchHasPlayerBanned = true;

          // ban occured after playing with him
          if (banStatus.style.color === 'red') {
            if (!playersBannedAfter.some((p) => p === steamId)) {
              playersBannedAfter.push(steamId);
            }

            matchHasPlayerBannedAfter = true;
          }
        }
      }

      // if we wish to exclude recent period with no red ban (supposing that banwaves did not happen yet)
      if (!config.ignoreRecentPeriodWithNoBanAfterTheMatch || playersBanned.length > 0) {
        if (!endDate) {
          endDate = domPart.querySelector('.csgo_scoreboard_inner_left > tbody').children[1].innerText;
        }

        players.push(...playersOfTheMatchWeDontKnowYet);

        matchesCount++;

        if (matchHasPlayerBanned) {
          matchesCountWithPlayerBanned++;
        }

        if (matchHasPlayerBannedAfter) {
          matchesCountWithPlayerBannedAfter++;
        }

        startDate = domPart.querySelector('.csgo_scoreboard_inner_left > tbody').children[1].innerText;
      }
    }
  }

  updateResults([{ text: '' }, { text: `Results on the period : ${startDate.substring(0, 10)} ⇒ ${endDate.substring(0, 10)}` }], true);
  if (config.ignoreRecentPeriodWithNoBanAfterTheMatch) {
    updateResults(`- we exclude recent period with no ban occuring after playing with you (supposing ban waves did not occured yet on recent period).`, true);
  }
  if (config.ignoreBansBefore) {
    updateResults(
      `- ignoring bans occured before playing with you older than ${config.ignoreBansBefore} days, players concerned : ${playersWithOldBan} (${getPourcentage(
        playersWithOldBan,
        players.length
      )} %)`,
      true
    );
  }

  updateResults('', true);
  updateResults(`Matches played : ${matchesCount}`, true);
  updateResults(`- with at least one player banned : ${matchesCountWithPlayerBanned} (${getPourcentage(matchesCountWithPlayerBanned, matchesCount)} %)`, true);
  updateResults(
    `- with at least one player banned after playing with you : ${matchesCountWithPlayerBannedAfter} (${getPourcentage(matchesCountWithPlayerBannedAfter, matchesCount)} %)`,
    true
  );
  updateResults('', true);
  updateResults(`Unique players : ${players.length}`, true);
  updateResults(`- banned : ${playersBanned.length} (${getPourcentage(playersBanned.length, players.length)} %)`, true);
  updateResults(`- banned after playing with you : ${playersBannedAfter.length} (${getPourcentage(playersBannedAfter.length, players.length)} %)`, true);

  // we list the banned players
  let bannedPlayersInfo = [];
  const bannedPlayersDomElements = [...document.querySelectorAll('.banchecker-bans')].filter((p) => window.getComputedStyle(p).color === 'rgb(255, 0, 0)');
  if (bannedPlayersDomElements.length > 0) {
    updateResults('', true);
    updateResults(`Players banned :`, true);
    for (let bannedPlayer of bannedPlayersDomElements) {
      const lastBanInDays = parseInt(bannedPlayer.attributes['title'].value.match(/Days since last ban: (\d+)/)[1], 10);
      bannedPlayersInfo.push({
        lastBanInDays: lastBanInDays,
        link: bannedPlayer.parentNode.querySelector('.linkTitle').href,
      });
    }
    bannedPlayersInfo = bannedPlayersInfo.sort((a, b) => (a.lastBanInDays > b.lastBanInDays ? 1 : a.lastBanInDays < b.lastBanInDays ? -1 : 0));

    if (bannedPlayersInfo.length > 0) {
      for (let bannedPlayer of bannedPlayersInfo) {
        updateResults(
          [
            {
              text: `- ${bannedPlayer.link}, banned ${bannedPlayer.lastBanInDays} days ago`,
              link: bannedPlayer.link,
            },
          ],
          true
        );
      }
    }
  }

  updateResults([{ text: '' }, { text: `Hover over ban status to check how many days have passed since last ban.` }], true);

  disableAllButtons(false);
}

function create(tag, id) {
  const elt = document.createElement(tag);
  if (id) {
    elt.id = id;
  }
  return elt;
}

function updateUI() {
  formatMatchsTable();
  updateFunStats();
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
  document.getElementById('ignoreBansBefore').value = config.ignoreBansBefore;
  document.getElementById('load-match-history-since').value = config.historyDate;
}

function init() {
  if (canContinue()) {
    updateUI();

    if (is5v5CompetitiveSection()) {
      if (config.gameType === 'short') {
        document.querySelector('.csgo_scoreboard_root').classList.add('hide-long-games');
      } else if (config.gameType === 'long') {
        document.querySelector('.csgo_scoreboard_root').classList.add('hide-short-games');
      }
    }

    if (!config.yourapikey) {
      loadMatchHistoryButton.disabled = checkBansButton.disabled = true;
      updateResults([{ text: `You must set your API key first ! Don't worry, this is easy. Just click on the button "Set API Key and options" !`, important: true }]);
    }
    updateFormValues();
  } else {
    updateStatus([
      {
        text: `This page lacks of one of those elements, we can't continue : unable to  profile link or it is an unknow section. You can create issue on https://github.com/BatStak/CSGO-history-ban-checker`,
        important: true,
      },
    ]);
    disableAllButtons(true);
  }
}

const extensionContainer = create('div', 'banchecker-menu');

const statusBar = create('div', 'status-bar');
const funStatsBar = create('div', 'funstats-bar');
const menuTop = create('div', 'menu-top');
const menuBottom = create('div', 'menu-bottom');
const statsResults = create('div', 'stats-results');

extensionContainer.appendChild(menuTop);
extensionContainer.appendChild(statusBar);
extensionContainer.appendChild(menuBottom);
extensionContainer.appendChild(statsResults);
extensionContainer.appendChild(funStatsBar);

document.querySelector('#subtabs').insertAdjacentElement('afterend', extensionContainer);

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
