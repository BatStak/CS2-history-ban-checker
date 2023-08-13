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
};

let profileURI = null;
let section = null;
let apikey = '';

const waitTimeRegex = /Wait Time\: (\d+)\:(\d+)/;
const matchTimeRegex = /Match Duration\: (\d+)\:(\d+)/;

function getSteamID64(minProfile) {
  return '76' + (parseInt(minProfile) + 561197960265728);
}

function parseTime(minutes, seconds) {
  let timeSecs = 0;
  timeSecs += parseInt(minutes) * 60;
  timeSecs += parseInt(seconds);
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

function updateResults(text, append) {
  if (append) {
    statsResults.innerHTML = statsResults.innerHTML + '<br />' + text;
  } else {
    statsResults.innerHTML = text;
  }
}

function updateStatus(text, append) {
  if (append) {
    statusBar.innerHTML = statusBar.textContent + '<br />' + text;
  } else {
    statusBar.innerHTML = text;
  }
}

function initVariables() {
  if (typeof content !== 'undefined') fetch = content.fetch; // fix for Firefox with disabled third-party cookies

  hasLoadMoreButton = !!document.querySelector('#load_more_button');
  profileURI = document.querySelector('.profile_small_header_texture > a')?.href;
  section = new URLSearchParams(window.location.search).get('tab');

  return hasLoadMoreButton && !!profileURI && !!section;
}

function updateFunStats() {
  if (isCommendOrReportsSection()) return;

  // we find the links on our profil to get the statistics of the match
  const myProfileLinks = document.querySelectorAll(`.inner_name .playerAvatar a[href="${profileURI.replace(/\/$/, '')}"]:not(.personal-stats-checked)`);
  for (let link of myProfileLinks) {
    myMatchStats = link.closest('tr').querySelectorAll('td');
    funStats.totalKills += parseInt(myMatchStats[2].textContent, 10);
    funStats.totalAssists += parseInt(myMatchStats[3].textContent, 10);
    funStats.totalDeaths += parseInt(myMatchStats[4].textContent, 10);
    link.classList.add('personal-stats-checked');
  }

  // to add to waiting time and match duration, we check the left panels
  const leftPanels = document.querySelectorAll('.val_left:not(.personal-stats-checked)');
  funStats.numberOfMatches += leftPanels.length;
  for (let leftPanel of leftPanels) {
    for (let td of leftPanel.querySelectorAll('td')) {
      const textContent = td.textContent.trim();
      if (waitTimeRegex.test(textContent)) {
        const hoursAndMinues = textContent.match(waitTimeRegex);
        funStats.totalWaitTime += parseTime(hoursAndMinues[1], hoursAndMinues[2]);
      } else if (matchTimeRegex.test(textContent)) {
        const hoursAndMinues = textContent.match(matchTimeRegex);
        funStats.totalTime += parseTime(hoursAndMinues[1], hoursAndMinues[2]);
      }
    }
    leftPanel.classList.add('personal-stats-checked');
  }

  funStatsBar.innerHTML = `
    Some fun stats for loaded matches:<br />
    Number of matches: ${funStats.numberOfMatches}<br />
    Total kills: ${funStats.totalKills}<br />
    Total assists: ${funStats.totalAssists}<br />
    Total deaths: ${funStats.totalDeaths}<br />
    K/D: ${(funStats.totalKills / funStats.totalDeaths).toFixed(3)}<br />
    (K+A)/D: ${((funStats.totalKills + funStats.totalAssists) / funStats.totalDeaths).toFixed(3)}<br />
    Total wait time: ${timeString(funStats.totalWaitTime)}<br />
    Total match time: ${timeString(funStats.totalTime)}
  `;
}

function formatMatchTables() {
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
    document.querySelectorAll('.generic_kv_table > tbody > tr:not(:first-child):not(.banchecker-profile)').forEach((report) => {
      const dateEl = report.querySelector('td:first-child');
      const daysSinceMatch = daysSince(dateEl.textContent);
      const minProfile = report.querySelector('.linkTitle').dataset.miniprofile;
      report.dataset.steamid64 = getSteamID64(minProfile);
      report.dataset.dayssince = daysSinceMatch;
      report.classList.add('banchecker-profile');
      report.classList.add('banchecker-formatted');
    });
  } else {
    document.querySelectorAll('.csgo_scoreboard_inner_right:not(.banchecker-formatted)').forEach((table) => {
      const leftColumn = table.parentElement.parentElement.querySelector('.csgo_scoreboard_inner_left');
      const daysSinceMatch = daysSince(leftColumn.textContent);
      table.querySelectorAll('tbody > tr').forEach((tr, i) => {
        if (i === 0 || tr.childElementCount < 3) return;
        const minProfile = tr.querySelector('.linkTitle').dataset.miniprofile;
        const steamID64 = getSteamID64(minProfile);
        tr.dataset.steamid64 = steamID64;
        tr.dataset.dayssince = daysSinceMatch;
        tr.classList.add('banchecker-profile');
      });
      table.classList.add('banchecker-formatted');
    });
  }
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
  const fetchBatch = (i, retryCount) => {
    updateResults(
      `Loaded unchecked matches contain ${uniquePlayers.length} players.<br />` +
        `We can scan 100 players at a time so we're sending ${batches.length} ` +
        `request${batches.length > 1 ? 's' : ''}.<br />` +
        `${i} successful request${i === 1 ? '' : 's'} so far...`
    );

    chrome.runtime.sendMessage(
      chrome.runtime.id,
      {
        action: 'fetchBans',
        apikey: apikey,
        batch: batches[i],
      },
      (json, error) => {
        if (error !== undefined) {
          updateResults(
            `Error while scanning players for bans:<br />${error}` +
              `${
                retryCount !== undefined && retryCount > 0
                  ? `<br /><br />Retrying to scan... ${maxRetries - retryCount}/3`
                  : `<br /><br />Couldn't scan for bans after ${maxRetries} retries :(`
              }`
          );
          if (retryCount > 0) {
            setTimeout(() => fetchBatch(i, retryCount - 1), 3000);
          }
          return;
        }
        json.players.forEach((player) => {
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
          playerEls.forEach((playerEl) => {
            playerEl.classList.add('banchecker-checked');
            verdictEl = playerEl.querySelector('.banchecker-bans');
            if (verdict) {
              if (daySinceLastMatch > player.DaysSinceLastBan) {
                verdictEl.style.color = 'red';
              } else {
                verdictEl.style.color = 'grey';
              }
              verdictEl.style.cursor = 'help';
              verdictEl.textContent = verdict;
              verdictEl.title = `Days since last ban: ${player.DaysSinceLastBan}`;
            } else {
              verdictEl.textContent = '';
            }
          });
        });
        if (batches.length > i + 1) {
          setTimeout(() => fetchBatch(i + 1), 1000);
        } else {
          updateResults(
            `Looks like we're done.<br /><br />` +
              (banStats.recentBans ? `<span class="banchecker-red">` : '') +
              `There were ${banStats.recentBans} players who got banned after playing with you!<br /><br />` +
              (banStats.recentBans ? `</span>` : '') +
              `Total ban stats: ${banStats.vacBans} VAC banned and ${banStats.gameBans} ` +
              `Game banned players in games we scanned (a lot of these could happen outside of CS:GO.)<br />` +
              `Total amount of unique players encountered: ${uniquePlayers.length}` +
              `<br /><br />Hover over ban status to check how many days have passed since last ban.`
          );
          banstats();
        }
      }
    );
  };
  if (uniquePlayers.length > 0) {
    fetchBatch(0, maxRetries);
  } else {
    toggleDisableAllButtons(false);
  }
}

function toggleDisableAllButtons(value) {
  bancheckerSettingsButton.disabled = loadMatchHistoryButton.disabled = checkBansButton.disabled = value;
}

function isCommendOrReportsSection() {
  return ['playerreports', 'playercommends'].includes(section);
}

function checkLoadedMatchesForBans() {
  toggleDisableAllButtons(true);
  if (isCommendOrReportsSection()) {
    const tableHeader = document.querySelector('.generic_kv_table > tbody > tr:first-child');
    if (!tableHeader.classList.contains('ban-column-added')) {
      tableHeader.classList.add('ban-column-added');
      const bansHeader = document.createElement('th');
      bansHeader.textContent = 'Ban';
      tableHeader.appendChild(bansHeader);
    }
    const playersRowsWithoutBanColumn = document.querySelectorAll('.generic_kv_table > tbody > tr:not(.ban-column-added)');
    playersRowsWithoutBanColumn.forEach((tr) => {
      tr.classList.add('ban-column-added');
      const bansPlaceholder = document.createElement('td');
      bansPlaceholder.classList.add('banchecker-bans');
      bansPlaceholder.textContent = '?';
      tr.appendChild(bansPlaceholder);
    });
  } else {
    const tables = document.querySelectorAll('.banchecker-formatted:not(.ban-column-added)');
    tables.forEach((table) => {
      table.classList.add('ban-column-added');
      table.querySelectorAll('tr').forEach((tr, i) => {
        if (i === 0) {
          const bansHeader = document.createElement('th');
          bansHeader.textContent = 'Bans';
          bansHeader.style.minWidth = '5.6em';
          tr.appendChild(bansHeader);
        } else if (tr.childElementCount > 3) {
          const bansPlaceholder = document.createElement('td');
          bansPlaceholder.classList.add('banchecker-bans');
          bansPlaceholder.textContent = '?';
          tr.appendChild(bansPlaceholder);
        } else {
          const scoreboard = tr.querySelector('td');
          if (scoreboard) scoreboard.setAttribute('colspan', '9');
        }
      });
    });
  }
  const playersEl = document.querySelectorAll('.banchecker-profile:not(.banchecker-checked):not(.banchecker-checking)');
  let playersArr = [];
  playersEl.forEach((player) => {
    player.classList.add('banchecker-checking');
    playersArr.push(player.dataset.steamid64);
  });
  checkBans(playersArr);
}

function createSteamButton(text) {
  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.classList.add('btn-default');
  const textNode = document.createTextNode(text);
  button.appendChild(textNode);
  return button;
}

function getResultsNodeList() {
  let selector = '.csgo_scoreboard_root > tbody > tr';
  if (isCommendOrReportsSection()) {
    selector = '.banchecker-profile';
  }
  return document.querySelectorAll(selector);
}

let timerLoadMatchHistory = null;
async function loadMatchHisory() {
  loadMatchHistoryStopButton.style.display = 'inline-block';
  toggleDisableAllButtons(true);
  const since = localStorage.getItem('banchecker-load-match-history-since');
  let status = '';
  if (since) {
    status = `Loading match history since ${since} !`;
  } else {
    status = `Loading all match history !`;
  }
  updateStatus(status);
  await new Promise((resolve) => {
    let numberOfMatches = 0;
    let attemptsToLoadMoreMatches = 0;
    const moreButton = document.getElementById('load_more_button');
    timerLoadMatchHistory = setInterval(() => {
      if (moreButton.offsetParent !== null) {
        const newNumberOfMatches = getResultsNodeList().length;
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
          updateStatus(`${status} ... loading since ${lastDate} ...`);
          if (since >= lastDate) {
            clearInterval(timerLoadMatchHistory);
            resolve();
          } else {
            numberOfMatches = newNumberOfMatches;
            moreButton.click();
          }
        }
      }
    }, 800);
  });
  updateStatus(`${status} Done !`);
  toggleDisableAllButtons(false);
  loadMatchHistoryStopButton.style.display = 'none';
}

function showSettings() {
  optionsContainer.style.display = 'block';
}

function saveSettings() {
  var yourapikey = document.getElementById('yourapikey').value;
  chrome.storage.sync.set({ yourapikey: yourapikey });
  optionsContainer.style.display = 'none';
}

async function banstats() {
  const conf = banstatsConfig;

  const players = [];
  const playersBanned = [];
  const playersBannedAfter = [];

  let matchesCount = 0;
  let matchesCountWithPlayerBanned = 0;
  let matchesCountWithPlayerBannedAfter = 0;
  let playersWithOldBan = 0;

  let startDate = '';
  let endDate = '';

  let wins = 0;
  let loses = 0;
  let draws = 0;

  let domMatchesParts = [...getResultsNodeList()];
  if (conf.filterGamesWithSteamId.length > 0) {
    // on filtre les matchs contenant les steamID en paramètre
    domMatchesParts = domMatchesParts.filter((domPart) => conf.filterGamesWithSteamId.some((steamId) => domPart.innerHTML.includes(steamId)));
  }

  // pour chaque match
  domMatchesParts.forEach((domPart) => {
    const scoreboardRows = domPart.querySelectorAll('.csgo_scoreboard_inner_right > tbody > tr');
    const playerRows = domPart.querySelectorAll('tr[data-steamid64]');

    // normalement impossible
    if (playerRows.length > 0) {
      // calcul des scores
      const scoreIndex = scoreboardRows.length / 2;
      const scoreValues = scoreboardRows[scoreIndex].innerText.split(':');
      const scoreLeft = parseInt(scoreValues[0].trim(), 10);
      const scoreRight = parseInt(scoreValues[1].trim(), 10);
      const isLong = scoreLeft + scoreRight > 16;

      // filtre des games selon le type (courte ou longue)
      if (!conf.filterGames || (conf.filterGames === 'LONG' && isLong) || (conf.filterGames === 'SHORT' && !isLong)) {
        // si j'ai un steamid en paramètre, je calcule le winrate
        if (conf.mysteamid) {
          let playerIndex = 0;
          scoreboardRows.forEach((row, index) => {
            if (row.attributes['data-steamid64']?.value === conf.mysteamid) {
              playerIndex = index;
            }
          });
          if ((playerIndex < scoreIndex && scoreLeft > scoreRight) || (playerIndex > scoreIndex && scoreRight > scoreLeft)) {
            wins++;
          } else if (scoreLeft === scoreRight) {
            draws++;
          } else {
            loses++;
          }
        }

        let matchHasPlayerBanned = false;
        let matchHasPlayerBannedAfter = false;
        const playersOfTheMatchWeDontKnowYet = [];

        // pour chaque joueur
        playerRows.forEach((player) => {
          const steamId = player.attributes['data-steamid64'].value;
          const banStatus = player.querySelector('.banchecker-bans');

          // on ajoute les joueurs que l'on connait pas à la liste
          if (!players.some((p) => p === steamId)) {
            playersOfTheMatchWeDontKnowYet.push(steamId);
          }

          // on a du texte dans la colonne "ban"
          const banLabel = banStatus.innerText.trim();
          if (banLabel != '') {
            const isAnOldBan = conf.ignoreBansBefore && parseInt(banStatus.attributes['title'].value.match(/Days since last ban: (\d+)/)[1], 10) > conf.ignoreBansBefore;

            if (isAnOldBan) {
              playersWithOldBan++;
            } else {
              if (!playersBanned.some((p) => p === steamId)) {
                playersBanned.push(steamId);
              }

              // on a un ban dans la game
              matchHasPlayerBanned = true;

              // c'est rouge, ça veut dire que le ban a eu lieu après la game
              if (banStatus.style.color === 'red') {
                if (!playersBannedAfter.some((p) => p === steamId)) {
                  playersBannedAfter.push(steamId);
                }

                // on a un ban qui a eu lieu après la game
                matchHasPlayerBannedAfter = true;
              }
            }
          }
        });

        // si on doit exclure la période récente sans ban after (on suppose qu'il manque des ban waves)
        if (!conf.ignoreRecentPeriodWithNoBanAfterTheMatch || playersBanned.length > 0) {
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

        if (!matchHasPlayerBannedAfter && conf.displayOnlyGamesWithBanAfterWhenFinished) {
          domPart.parentNode.removeChild(domPart);
        }
      }
    }
  });

  let results = '';
  if (conf.displayOnlyGamesWithBanAfterWhenFinished) {
    results += `<br />We have removed all matches on the page with no ban occured after playing with you!<br />`;
  }
  results += `<br />Results on the period : ${startDate.substring(0, 10)} => ${endDate.substring(0, 10)}<br />`;
  if (conf.ignoreRecentPeriodWithNoBanAfterTheMatch || conf.ignoreBansBefore) {
    results += '<ul>';
  }
  if (conf.ignoreRecentPeriodWithNoBanAfterTheMatch) {
    results += `<li>we exclude recent period with no ban occuring after playing with you (supposing ban waves did not occured yet on recent period).</li>`;
  }
  if (conf.ignoreBansBefore) {
    results += `<li>ignoring bans occured before playing with you older than ${conf.ignoreBansBefore} days, players concerned : ${playersWithOldBan} (${
      Math.round((playersWithOldBan / players.length) * 10000) / 100
    } %)`;
  }
  if (conf.ignoreRecentPeriodWithNoBanAfterTheMatch || conf.ignoreBansBefore) {
    results += '</ul>';
  }

  results += `Matches played : ${matchesCount}`;
  results += `<ul><li>with at least one player banned : ${matchesCountWithPlayerBanned} (${Math.round((matchesCountWithPlayerBanned / matchesCount) * 10000) / 100} %)</li>`;
  results += `<li>with at least one player banned after playing with you : ${matchesCountWithPlayerBannedAfter} (${
    Math.round((matchesCountWithPlayerBannedAfter / matchesCount) * 10000) / 100
  } %)</li></ul>`;
  results += `Unique players : ${players.length}`;
  results += `<ul><li>banned : ${playersBanned.length} (${Math.round((playersBanned.length / players.length) * 10000) / 100} %)</li>`;
  results += `<li>banned after playing with you : ${playersBannedAfter.length} (${Math.round((playersBannedAfter.length / players.length) * 10000) / 100} %)</li></ul>`;
  if (conf.mysteamid) {
    results += `wins : ${wins}, loses: ${loses}, draws: ${draws}`;
    results += `winrate : ${Math.round((wins / matchesCount) * 10000) / 100} %, including draws : ${Math.round(((wins + draws) / matchesCount) * 10000) / 100} %`;
    results += `loserate : ${Math.round((loses / matchesCount) * 10000) / 100} %`;
  }

  // banned players
  let bannedPlayersInfo = [];
  const bannedPlayersDomElements = [...document.querySelectorAll('.banchecker-bans')].filter((p) => window.getComputedStyle(p).color === 'rgb(255, 0, 0)');
  if (bannedPlayersDomElements.length > 0) {
    results += `Players banned :`;
    for (let bannedPlayer of bannedPlayersDomElements) {
      const lastBanInDays = parseInt(bannedPlayer.attributes['title'].value.match(/Days since last ban: (\d+)/)[1], 10);
      bannedPlayersInfo.push({
        lastBanInDays: lastBanInDays,
        link: bannedPlayer.parentNode.querySelector('.linkTitle').href,
      });
    }
    bannedPlayersInfo = bannedPlayersInfo.sort((a, b) => (a.lastBanInDays > b.lastBanInDays ? 1 : a.lastBanInDays < b.lastBanInDays ? -1 : 0));

    if (bannedPlayersInfo.length > 0) {
      results += '<ul>';
      for (let bannedPlayer of bannedPlayersInfo) {
        results += `<li><a href="${bannedPlayer.link}" target="_blank">${bannedPlayer.link}</a>, banned ${bannedPlayer.lastBanInDays} days ago</li>`;
      }
      results += '</ul>';
    }
  }

  updateResults(results, true);

  toggleDisableAllButtons(false);
}

const extensionContainer = document.createElement('div');
extensionContainer.setAttribute('id', 'banchecker-menu');

const statusBar = document.createElement('div');
statusBar.setAttribute('id', 'status-bar');

const funStatsBar = document.createElement('div');
funStatsBar.setAttribute('id', 'funstats-bar');

const menuTop = document.createElement('div');

const menuBottom = document.createElement('div');

const statsResults = document.createElement('div');
statsResults.setAttribute('id', 'stats-results');

extensionContainer.appendChild(menuTop);
extensionContainer.appendChild(statusBar);
extensionContainer.appendChild(menuBottom);
extensionContainer.appendChild(statsResults);
extensionContainer.appendChild(funStatsBar);

document.querySelector('#subtabs').insertAdjacentElement('afterend', extensionContainer);

const loadMoreButton = document.querySelector('.load_more_history_area #load_more_clickable');
const callback = (mutationList, observer) => {
  for (const mutation of mutationList) {
    if (mutation.attributeName === 'style') {
      if (loadMoreButton.style.display !== 'none') {
        formatMatchTables();
        updateFunStats();
      }
    }
  }
};
const observer = new MutationObserver(callback);
observer.observe(loadMoreButton, { attributes: true });

const checkBansButton = createSteamButton('Check loaded matches for bans');
checkBansButton.onclick = () => {
  checkLoadedMatchesForBans();
};

const loadMatchHistoryButton = createSteamButton('Load match history since');
loadMatchHistoryButton.onclick = () => {
  localStorage.setItem('banchecker-load-match-history-since', document.getElementById('load-match-history-since')?.value);
  loadMatchHisory();
};

const loadMatchHistoryStopButton = createSteamButton('Stop');
loadMatchHistoryStopButton.style.display = 'none';
loadMatchHistoryStopButton.onclick = () => {
  if (timerLoadMatchHistory) {
    clearInterval(timerLoadMatchHistory);
    timerLoadMatchHistory = null;
  }
  toggleDisableAllButtons(false);
  loadMatchHistoryStopButton.style.display = 'none';
};

const dateSinceHistoryInput = document.createElement('input');
dateSinceHistoryInput.setAttribute('type', 'text');
dateSinceHistoryInput.setAttribute('id', 'load-match-history-since');
dateSinceHistoryInput.style.width = '100px';
let dateAsString = localStorage.getItem('banchecker-load-match-history-since');
if (!dateAsString) {
  const date = new Date();
  date.setDate(date.getDate() - 500);
  dateAsString = `${date.getFullYear()}-${date.getMonth() < 10 ? '0' : ''}${date.getMonth()}-${date.getDate() < 10 ? '0' : ''}${date.getDate()}`;
}
dateSinceHistoryInput.value = dateAsString;

const dateSinceHistoryPlaceholder = document.createElement('div');
dateSinceHistoryPlaceholder.style.display = 'inline-block';
dateSinceHistoryPlaceholder.style.margin = '0 10px';
dateSinceHistoryPlaceholder.innerHTML = '(YYYY-MM-DD)';

const bancheckerSettingsButton = createSteamButton('Set API Key and options');
bancheckerSettingsButton.onclick = () => showSettings();

menuTop.appendChild(bancheckerSettingsButton);
menuTop.appendChild(loadMatchHistoryButton);
menuTop.appendChild(dateSinceHistoryInput);
menuTop.appendChild(dateSinceHistoryPlaceholder);
menuTop.appendChild(loadMatchHistoryStopButton);
menuBottom.appendChild(checkBansButton);

const optionsContainer = document.createElement('div');
optionsContainer.setAttribute('id', 'banchecker-options');
const optionsContainerInner = document.createElement('div');
const optionsCloseButton = document.createElement('button');
optionsCloseButton.innerText = 'Save';
optionsCloseButton.setAttribute('type', 'button');
optionsCloseButton.onclick = () => saveSettings();
optionsContainerInner.innerHTML = `
Your API key:
<input type="text" id="yourapikey" size="35" />
<br />
<a href="http://steamcommunity.com/dev/apikey" target="_blank">Get your API Key here</a><br />
`;
optionsContainerInner.appendChild(optionsCloseButton);
optionsContainer.appendChild(optionsContainerInner);
extensionContainer.appendChild(optionsContainer);

const banstatsConfig = {
  displayOnlyGamesWithBanAfterWhenFinished: false, // to remove in DOM matches with no red ban
  ignoreBansBefore: 5 * 365, // we ignore grey bans older than this number (in days)
  mysteamid: '', // if we want winrate calculation, me : 76561197962198400, my friend : 76561197985267551.
  filterGames: '', // 'SHORT' or 'LONG' to filter games
  ignoreRecentPeriodWithNoBanAfterTheMatch: false, // ignore recent period with no red ban (banned after the game)
  filterGamesWithSteamId: [], // to only focus on games with specific steam id
};

if (initVariables()) {
  formatMatchTables();
  updateFunStats();

  chrome.storage.sync.get(['yourapikey'], (data) => {
    apikey = data?.yourapikey;
    if (!apikey) {
      loadMatchHistoryButton.disabled = checkBansButton.disabled = true;
      updateResults(`<span class="banchecker-warning">You must set your API key first ! Don't worry, this is easy. Just click on the button "Set your API key" !</span>`);
    } else {
      document.getElementById('yourapikey').value = apikey;
    }
  });
} else {
  updateStatus(
    `<span class="banchecker-red">This page lacks of one of those elements, we can't continue : "load more history" button, profile link or is an unknow section. You can create issue on <a href="https://github.com/BatStak/CSGO-match-history-ban-checker" target="_blank">github.</a></span>`
  );
  toggleDisableAllButtons(true);
}
