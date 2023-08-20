function is5v5CompetitiveSection() {
  return section === 'matchhistorycompetitive';
}

function isCommendOrReportsSection() {
  return ['playerreports', 'playercommends'].includes(section);
}

function canContinue() {
  if (typeof content !== 'undefined') fetch = content.fetch; // fix for Firefox with disabled third-party cookies

  profileURI = document.querySelector('.profile_small_header_texture > a')?.href;

  return !!profileURI && !!section;
}

function addFilterGameSelector(selector) {
  let editedSelector = selector;

  if (config.gameType === 'long') {
    editedSelector = '.long-game ' + editedSelector;
  } else if (config.gameType === 'short') {
    editedSelector = '.short-game ' + editedSelector;
  }

  return editedSelector;
}

function updateFunStats() {
  if (isCommendOrReportsSection()) return;

  let selector = addFilterGameSelector(`.inner_name .playerAvatar a[href="${profileURI}"]:not(.personal-stats-checked)`);

  // we find the links on our profil to get the statistics of the match
  const myProfileLinks = document.querySelectorAll(selector);
  for (let link of myProfileLinks) {
    const playerRow = link.closest('tr');
    const matchRow = playerRow.closest('table').parentNode.parentNode;

    const myMatchStats = playerRow.querySelectorAll('td');
    funStats.totalKills += parseInt(myMatchStats[2].innerText, 10);
    funStats.totalAssists += parseInt(myMatchStats[3].innerText, 10);
    funStats.totalDeaths += parseInt(myMatchStats[4].innerText, 10);

    const leftPanel = matchRow.querySelector('.val_left');
    for (let td of leftPanel.querySelectorAll('td')) {
      const innerText = td.innerText.trim();
      if (mapNameRegex.test(innerText)) {
        const mapName = innerText.match(mapNameRegex)[2];

        // set map name for all players
        matchRow.querySelectorAll('tr[data-steamid64]').forEach((player) => {
          player.dataset.map = mapName;
        });

        if (!mapsStats.some((map) => map.name === mapName)) {
          mapsStats.push({
            name: mapName,
            count: 0,
            wins: 0,
            draws: 0,
            loses: 0,
            bans: 0,
            bansAfter: 0,
          });
        }
        const mapStats = mapsStats.find((map) => map.name === mapName);
        mapStats.count++;
        if (matchRow.classList.contains('match-win')) {
          mapStats.wins++;
        } else if (matchRow.classList.contains('match-lose')) {
          mapStats.loses++;
        } else if (matchRow.classList.contains('match-draw')) {
          mapStats.draws++;
        }
      } else if (waitTimeRegex.test(innerText)) {
        const hoursAndMinues = innerText.match(waitTimeRegex);
        funStats.totalWaitTime += parseTime(hoursAndMinues[1], hoursAndMinues[2]);
      } else if (matchTimeRegex.test(innerText)) {
        const hoursAndMinues = innerText.match(matchTimeRegex);
        funStats.totalTime += parseTime(hoursAndMinues[1], hoursAndMinues[2]);
      }
    }

    funStats.numberOfMatches++;

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
Total match time: ${timeString(funStats.totalTime)}`;
}

function updateGlobalStats() {
  if (!mapsStats.length) {
    return;
  }

  statsMaps.textContent = '';

  statsMaps.appendChild(create('hr'));

  const period = create('div', 'period');
  period.textContent = `Period from ${startDate} to ${endDate}`;
  statsMaps.appendChild(period);

  const playerTable = create('table');
  playerTable.classList.add('player-stats');
  const playerTbody = create('tbody');
  playerTable.appendChild(playerTbody);
  const playerHeaderRow = create('tr');
  const thPlayer1 = create('th');
  thPlayer1.textContent = 'Unique players';
  const thPlayer2 = create('th');
  thPlayer2.textContent = 'Banned';
  const thPlayer3 = create('th');
  thPlayer3.textContent = 'Banned after playing with you';
  playerHeaderRow.appendChild(thPlayer1);
  playerHeaderRow.appendChild(thPlayer2);
  playerHeaderRow.appendChild(thPlayer3);
  playerTbody.appendChild(playerHeaderRow);
  const playerRow = create('tr');
  const tdPlayer1 = create('td');
  tdPlayer1.textContent = playersList.length;
  const tdPlayer2 = create('td');
  tdPlayer2.textContent = checkBanStarted ? `${bannedPlayers.length} [${getPourcentage(bannedPlayers.length, playersList.length)} %]` : '?';
  const tdPlayer3 = create('td');
  const banAfterCount = bannedPlayers.filter((bannedPlayer) => bannedPlayer.after).length;
  tdPlayer3.textContent = checkBanStarted ? `${banAfterCount} [${getPourcentage(banAfterCount, playersList.length)} %]` : '?';
  playerRow.appendChild(tdPlayer1);
  playerRow.appendChild(tdPlayer2);
  playerRow.appendChild(tdPlayer3);
  playerTbody.appendChild(playerRow);

  const table = create('table');
  table.classList.add('map-stats');
  const tbody = create('tbody');
  table.appendChild(tbody);

  const headerRow = create('tr');
  const th1 = create('th');
  th1.classList.add('map-name');
  const th2 = create('th');
  th2.classList.add('map-sample');
  const th3 = create('th');
  th3.classList.add('map-win');
  const th4 = create('th');
  th4.classList.add('map-draw');
  const th5 = create('th');
  th5.classList.add('map-lose');
  const th6 = create('th');
  th6.classList.add('map-ban');
  const th7 = create('th');
  th7.classList.add('map-ban-after');
  headerRow.appendChild(th1);
  headerRow.appendChild(th2);
  headerRow.appendChild(th3);
  headerRow.appendChild(th4);
  headerRow.appendChild(th5);
  headerRow.appendChild(th6);
  headerRow.appendChild(th7);
  tbody.appendChild(headerRow);

  th1.textContent = 'Map';
  th1.title = 'map name';
  th2.textContent = 'Sample';
  th2.title = 'sample size';
  th3.textContent = 'Win';
  th3.title = 'win [win rate]';
  th4.textContent = 'Draw';
  th4.title = 'draw [draw rate]';
  th5.textContent = 'Lose';
  th5.title = 'lose [lose rate]';
  th6.textContent = 'With ban';
  th6.title = 'Someone has been banned in the match, before or after playing with you';
  th7.textContent = 'With ban after';
  th7.title = 'Someone has been banned in the match after playing with you';

  let total = {
    count: 0,
    wins: 0,
    draws: 0,
    loses: 0,
    bans: 0,
    bansAfter: 0,
  };

  for (let map of mapsStats.sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0))) {
    const mapRow = create('tr');
    const td1 = create('td');
    const td2 = create('td');
    const td3 = create('td');
    const td4 = create('td');
    const td5 = create('td');
    const td6 = create('td');
    const td7 = create('td');
    mapRow.appendChild(td1);
    mapRow.appendChild(td2);
    mapRow.appendChild(td3);
    mapRow.appendChild(td4);
    mapRow.appendChild(td5);
    mapRow.appendChild(td6);
    mapRow.appendChild(td7);
    tbody.appendChild(mapRow);

    td1.textContent = map.name;
    td2.textContent = map.count;
    td3.textContent = `${map.wins} [${getPourcentage(map.wins, map.count)} %]`;
    td4.textContent = `${map.draws} [${getPourcentage(map.draws, map.count)} %]`;
    td5.textContent = `${map.loses} [${getPourcentage(map.loses, map.count)} %]`;
    td6.textContent = checkBanStarted ? `${map.bans} [${getPourcentage(map.bans, map.count)} %]` : '?';
    td7.textContent = checkBanStarted ? `${map.bansAfter} [${getPourcentage(map.bansAfter, map.count)} %]` : '?';

    total.count += map.count;
    total.wins += map.wins;
    total.draws += map.draws;
    total.loses += map.loses;
    total.bans += map.bans;
    total.bansAfter += map.bansAfter;
  }

  const totalRow = create('tr');
  totalRow.classList.add('map-total');
  const tdTotal1 = create('td');
  const tdTotal2 = create('td');
  const tdTotal3 = create('td');
  const tdTotal4 = create('td');
  const tdTotal5 = create('td');
  const tdTotal6 = create('td');
  const tdTotal7 = create('td');
  totalRow.appendChild(tdTotal1);
  totalRow.appendChild(tdTotal2);
  totalRow.appendChild(tdTotal3);
  totalRow.appendChild(tdTotal4);
  totalRow.appendChild(tdTotal5);
  totalRow.appendChild(tdTotal6);
  totalRow.appendChild(tdTotal7);
  tbody.appendChild(totalRow);

  tdTotal1.textContent = 'Total';
  tdTotal2.textContent = total.count;
  tdTotal3.textContent = `${total.wins} [${getPourcentage(total.wins, total.count)} %]`;
  tdTotal4.textContent = `${total.draws} [${getPourcentage(total.draws, total.count)} %]`;
  tdTotal5.textContent = `${total.loses} [${getPourcentage(total.loses, total.count)} %]`;
  tdTotal6.textContent = checkBanStarted ? `${total.bans} [${getPourcentage(total.bans, total.count)} %]` : '?';
  tdTotal7.textContent = checkBanStarted ? `${total.bansAfter} [${getPourcentage(total.bansAfter, total.count)} %]` : '?';

  statsMaps.appendChild(playerTable);
  statsMaps.appendChild(table);
}

function daysSince(dateString, updateDates) {
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

    if (updateDates) {
      const formattedDate = `${matchDate[1]}-${matchDate[2]}-${matchDate[3]}`;
      if (!endDate) {
        endDate = formattedDate;
      }
      startDate = formattedDate;
    }
  }

  return daysSinceMatch;
}

function formatMatchsTable() {
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
    for (let rightPanel of document.querySelectorAll('.csgo_scoreboard_inner_right:not(.banchecker-formatted)')) {
      const matchRow = rightPanel.parentElement.parentElement;
      const score = rightPanel.querySelector('.csgo_scoreboard_score').innerText.match(scoreRegex);
      const playerRows = rightPanel.querySelectorAll('tbody > tr');
      const playerRow = rightPanel.querySelector(`.inner_name .playerAvatar a[href="${profileURI}"]`).parentElement.parentElement.parentElement;
      const rowsCount = playerRows.length;
      const playerIndex = Array.from(playerRows).indexOf(playerRow);
      const scoreTeam1 = parseInt(score[1], 10);
      const scoreTeam2 = parseInt(score[2], 10);
      const isFirstTeamWin = scoreTeam1 > scoreTeam2;
      const isPlayerInFirstTeam = playerIndex < Math.floor(rowsCount / 2);

      if (score[1] === score[2]) {
        matchRow.classList.add('match-draw');
      } else if (isPlayerInFirstTeam === isFirstTeamWin) {
        matchRow.classList.add('match-win');
      } else {
        matchRow.classList.add('match-lose');
      }

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

      const gameNotFiltered = config.gameType === 'long' ? isLong : config.gameType === 'short' ? isShort : true;

      const leftColumn = matchRow.querySelector('.csgo_scoreboard_inner_left');
      const daysSinceMatch = daysSince(leftColumn.innerText, gameNotFiltered);
      rightPanel.querySelectorAll('tbody > tr').forEach((tr, i) => {
        if (i === 0 || tr.childElementCount < 3) return;
        const profileLink = tr.querySelector('.linkTitle');
        const minProfileId = profileLink.dataset.miniprofile;
        const steamid64 = getSteamID64(minProfileId);
        tr.dataset.steamid64 = steamid64;
        tr.dataset.dayssince = daysSinceMatch;
        tr.dataset.matchindex = matchIndex;
        tr.classList.add('banchecker-profile');
        if (!playersList.includes(steamid64) && gameNotFiltered) {
          playersList.push(steamid64);
        }
      });
      rightPanel.classList.add('banchecker-formatted');
      matchIndex++;
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
          const playerEl = playerEls[0];
          const daySinceLastMatch = parseInt(playerEl.dataset.dayssince, 10);
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
            const bannedAfter = daySinceLastMatch > player.DaysSinceLastBan;
            bannedPlayers.push({
              steamid: playerEl.dataset.steamid64,
              daySinceLastBan: player.DaysSinceLastBan,
              after: bannedAfter,
              profileUrl: playerEl.querySelector('.linkTitle').href,
            });
            const daysAfter = daySinceLastMatch - player.DaysSinceLastBan;
            if (bannedAfter) {
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
              playerEl.classList.add('player-banned');
              const mapStats = mapsStats.find((mapStats) => mapStats.name === playerEl.dataset.map);
              const matchBanAlreadyCounted = matchIndexWithBans.includes(playerEl.dataset.matchindex);
              matchIndexWithBans.push(playerEl.dataset.matchindex);
              if (!matchBanAlreadyCounted && mapStats) {
                mapStats.bans++;
              }
              if (daySinceLastMatch > player.DaysSinceLastBan) {
                playerEl.classList.add('after');
                verdictEl.style.color = 'red';
                if (!isCommendOrReportsSection()) {
                  playerEl.parentNode.parentNode.parentNode.parentNode.style.backgroundColor = '#583a3a';
                }
                if (!matchBanAlreadyCounted && mapStats) {
                  mapStats.bansAfter++;
                }
              } else {
                verdictEl.style.color = 'yellow';
              }
              verdictEl.style.cursor = 'help';
              verdictEl.innerText = verdict;
              verdictEl.title = `Days since last ban: ${player.DaysSinceLastBan}`;
            } else {
              verdictEl.innerText = '';
            }
          }
        }
        updateGlobalStats();
        if (batches.length > i + 1) {
          setTimeout(() => checkBansOnApi(i + 1, maxRetries), 1000);
        } else {
          const plural = banStats.recentBans > 1;
          updateResults([
            { text: `Looks like we're done.` },
            { text: '' },
            {
              text: `Total ban stats: ${banStats.vacBans} VAC banned and ${banStats.gameBans} Game banned players in games we scanned (a lot of these could happen outside of CS:GO.)`,
            },
            { text: '' },
            {
              text: `${plural ? `There were ` : `There is `}${banStats.recentBans} player${plural ? `s ` : ``} who got banned after playing with you (more likely to be on CSGO): `,
              important: banStats.recentBans > 0,
            },
          ]);
          displayBannedPlayers();
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
  checkBanStarted = true;
  disableAllButtons(true);
  let selector = '.banchecker-profile:not(.banchecker-checked):not(.banchecker-checking)';
  if (is5v5CompetitiveSection()) {
    selector = addFilterGameSelector(selector);
  }
  let playersArr = [];
  for (let player of document.querySelectorAll(selector)) {
    player.classList.add('banchecker-checking');
    playersArr.push(player.dataset.steamid64);
  }
  checkBans(playersArr);
}

function getResultsNodeList() {
  let selector = '.csgo_scoreboard_root > tbody > tr';
  if (isCommendOrReportsSection()) {
    selector = '.banchecker-profile';
  }
  return document.querySelectorAll(selector);
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

async function displayBannedPlayers() {
  const bannedPlayersAfter = bannedPlayers
    .filter((bannedPlayer) => bannedPlayer.after)
    .sort((a, b) => (a.daySinceLastBan > b.daySinceLastBan ? 1 : a.daySinceLastBan < b.daySinceLastBan ? -1 : 0));

  for (let bannedPlayer of bannedPlayersAfter) {
    updateResults(
      [
        {
          text: `- ${bannedPlayer.profileUrl}, banned ${bannedPlayer.daySinceLastBan} days ago`,
          link: bannedPlayer.profileUrl,
        },
      ],
      true
    );
  }

  updateResults([{ text: '' }, { text: `Hover over ban status to check how many days have passed since last ban.` }], true);

  disableAllButtons(false);
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
