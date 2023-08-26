function updateFunStats() {
  if (isCommendOrReportsSection()) return;

  let selector = addFilterGameSelector(`.inner_name .playerAvatar a[href="${profileURI}"]:not(.${myProfileStatsCheckedClass})`);

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
        if (matchRow.classList.contains(matchWinClass)) {
          mapStats.wins++;
        } else if (matchRow.classList.contains(matchLoseClass)) {
          mapStats.loses++;
        } else if (matchRow.classList.contains(matchDrawClass)) {
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

    link.classList.add(myProfileStatsCheckedClass);
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
  playerTable.classList.add('csgo-history-table');
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
  table.classList.add('csgo-history-table');
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

function getDaysSinceAndUpdatePeriod(dateString, updateDates) {
  const results = {
    daysSinceMatch: -1,
    dateAsString: null,
  };
  const matchDate = dateString.match(dateMatchRegex);
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
    const formattedDate = `${matchDate[1]}-${matchDate[2]}-${matchDate[3]}`;

    results.daysSinceMatch = Math.ceil(timePassed / (1000 * 60 * 60 * 24));
    results.dateAsString = formattedDate;

    if (updateDates) {
      if (!endDate) {
        endDate = formattedDate;
      }
      startDate = formattedDate;
    }
  }

  return results;
}

function formatMatchsTable() {
  if (isCommendOrReportsSection()) {
    for (let report of document.querySelectorAll(`.generic_kv_table > tbody > tr:not(:first-child):not(.${profileToCheckClass})`)) {
      const dateEl = report.querySelector('td:first-child');
      const daysSinceMatch = getDaysSinceAndUpdatePeriod(dateEl.innerText).daysSinceMatch;
      const minProfileId = report.querySelector('.linkTitle').dataset.miniprofile;
      report.dataset.steamid64 = getSteamID64(minProfileId);
      report.dataset.dayssince = daysSinceMatch;
      report.classList.add(profileToCheckClass);
      report.classList.add(tableFormattedClass);
    }
  } else {
    for (let rightPanel of document.querySelectorAll(`.csgo_scoreboard_inner_right:not(.${tableFormattedClass})`)) {
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
        matchRow.classList.add(matchDrawClass);
      } else if (isPlayerInFirstTeam === isFirstTeamWin) {
        matchRow.classList.add(matchWinClass);
      } else {
        matchRow.classList.add(matchLoseClass);
      }

      const maxScore = Math.max(scoreTeam1, scoreTeam2);
      const isLong = maxScore === 15 || maxScore === 16;
      const isShort = maxScore === 8 || maxScore === 9;
      const isAborted = !isLong && !isShort;
      if (isLong) {
        matchRow.classList.add(longGameClass);
      } else if (isShort) {
        matchRow.classList.add(shortGameClass);
      } else if (isAborted) {
        matchRow.classList.add(abortedGameClass);
      }

      const gameNotFiltered = config.gameType === 'long' ? isLong : config.gameType === 'short' ? isShort : true;

      const leftColumn = matchRow.querySelector('.csgo_scoreboard_inner_left');
      const results = getDaysSinceAndUpdatePeriod(leftColumn.innerText, gameNotFiltered);
      rightPanel.querySelectorAll('tbody > tr').forEach((tr, i) => {
        if (i === 0 || tr.childElementCount < 3) return;
        const profileLink = tr.querySelector('.linkTitle');
        const minProfileId = profileLink.dataset.miniprofile;
        const steamid64 = getSteamID64(minProfileId);
        tr.dataset.steamid64 = steamid64;
        tr.dataset.dayssince = results.daysSinceMatch;
        tr.dataset.datesince = results.dateAsString;
        tr.dataset.matchindex = matchIndex;
        tr.classList.add(profileToCheckClass);
        if (!playersList.includes(steamid64) && gameNotFiltered) {
          playersList.push(steamid64);
        }
      });
      rightPanel.classList.add(tableFormattedClass);
      matchIndex++;
    }
  }
  addBanColumns();
}

function addBanColumns() {
  if (isCommendOrReportsSection()) {
    const tableHeader = document.querySelector('.generic_kv_table > tbody > tr:first-child');
    if (!tableHeader.classList.contains(columnBanResultAddedClass)) {
      tableHeader.classList.add(columnBanResultAddedClass);
      const bansHeader = create('th');
      bansHeader.innerText = 'Ban';
      tableHeader.appendChild(bansHeader);
    }
    for (let tr of document.querySelectorAll(`.generic_kv_table > tbody > tr:not(.${columnBanResultAddedClass})`)) {
      tr.classList.add(columnBanResultAddedClass);
      const bansPlaceholder = create('td');
      bansPlaceholder.classList.add(columnBanResultClass);
      bansPlaceholder.innerText = '?';
      tr.appendChild(bansPlaceholder);
    }
  } else {
    for (let table of document.querySelectorAll(`.${tableFormattedClass}:not(.${columnBanResultAddedClass})`)) {
      table.classList.add(columnBanResultAddedClass);
      table.querySelectorAll('tr').forEach((tr, i) => {
        if (i === 0) {
          const bansHeader = create('th');
          bansHeader.innerText = 'Bans';
          bansHeader.style.minWidth = '5.6em';
          tr.appendChild(bansHeader);
        } else if (tr.childElementCount > 3) {
          const bansPlaceholder = create('td');
          bansPlaceholder.classList.add(columnBanResultClass);
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
  stopCheckBan = false;
  toggleStopButton(stopCheckBansButton, true);
  disableAllButtons(true);
  let selector = `.${profileToCheckClass}:not(.${profileCheckedClass})`;
  if (is5v5CompetitiveSection()) {
    selector = addFilterGameSelector(selector);
  }
  let players = [];
  for (let player of document.querySelectorAll(selector)) {
    players.push(player.dataset.steamid64);
  }

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

  const stop = () => {
    disableAllButtons(false);
    toggleStopButton(stopCheckBansButton, false);
  };

  const checkBansOnApi = (requestIndex, retryCount) => {
    updateResults([
      { text: `Loaded unchecked matches contain ${uniquePlayers.length} players.` },
      { text: `We can scan 100 players at a time so we're sending ${batches.length} request${batches.length > 1 ? 's' : ''}` },
      { text: `${requestIndex} successful request${requestIndex === 1 ? '' : 's'} so far...` },
    ]);

    chrome.runtime.sendMessage(
      chrome.runtime.id,
      {
        action: 'fetchBans',
        apikey: config.yourapikey,
        batch: batches[requestIndex],
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
            setTimeout(() => checkBansOnApi(requestIndex, retryCount - 1), 3000);
          }
          return;
        }
        for (let player of json.players) {
          const playerEls = document.querySelectorAll(`tr[data-steamid64="${player.SteamId}"]`);
          const playerEl = playerEls[0];
          const daySinceLastMatch = playerEl ? parseInt(playerEl.dataset.dayssince, 10) : 0;
          let verdict = '';
          let verdictPeople = '';
          if (player.NumberOfVACBans > 0) {
            verdict += 'VAC';
            verdictPeople += 'VAC';
            banStats.vacBans++;
          }
          if (player.NumberOfGameBans > 0) {
            if (verdict) {
              verdict += ' &\n';
              verdictPeople += ' & ';
            }
            verdict += 'Game';
            verdictPeople += 'Game ban';
            banStats.gameBans++;
          }
          if (verdict) {
            const bannedAfter = daySinceLastMatch > player.DaysSinceLastBan;
            const linkTitle = playerEl ? playerEl.querySelector('.linkTitle') : '';
            const daysAfter = daySinceLastMatch - player.DaysSinceLastBan;
            if (bannedAfter) {
              banStats.recentBans++;
            }
            if (daysAfter >= 0) {
              verdict += '+' + daysAfter;
            } else {
              verdict += daysAfter;
            }
            verdictPeople += `, last ban ${player.DaysSinceLastBan} days ago`;
            bannedPlayers.push({
              verdict: verdict,
              verdictPeople: verdictPeople,
              steamid: player.SteamId,
              daySinceLastBan: player.DaysSinceLastBan,
              daySinceLastMatch: daySinceLastMatch,
              dateSinceLastMatch: playerEl ? playerEl.dataset.datesince : 0,
              after: bannedAfter,
              profileUrl: linkTitle ? linkTitle.href : '',
              profileName: linkTitle ? linkTitle.innerText.trim() : '',
              profileAvatar: playerEl ? playerEl.querySelector('.playerAvatar img').src : '',
            });
          }
          for (let playerEl of playerEls) {
            playerEl.classList.add(profileCheckedClass);
            verdictEl = playerEl.querySelector(`.${columnBanResultClass}`);
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
        displayBannedPlayers();
        updatePeopleList();
        if (stopCheckBan) {
          updateResults('Stopped.');
          stop();
        } else if (batches.length > requestIndex + 1) {
          setTimeout(() => checkBansOnApi(requestIndex + 1, maxRetries), 1000);
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
              text: `${plural ? `There were ` : `There is `}${banStats.recentBans} player${plural ? `s ` : ``} who got banned after playing with you (more likely to be on CSGO).`,
              important: banStats.recentBans > 0,
            },
          ]);
          stop();
        }
      }
    );
  };
  if (uniquePlayers.length > 0) {
    checkBansOnApi(0, maxRetries);
  } else {
    stop();
  }
}

function stopTimerLoadMatchHistory() {
  if (timerLoadMatchHistory) {
    clearInterval(timerLoadMatchHistory);
    timerLoadMatchHistory = null;
  }
}

async function loadMatchHistory() {
  saveHistoryDate();
  toggleStopButton(stopLoadMatchHistoryButton, true);
  disableAllButtons(true);
  let status = '';
  if (config.historyDate) {
    status = `Loading match history since ${config.historyDate} !`;
  } else {
    status = `Loading all match history !`;
  }
  updateStatus(status);
  await new Promise((resolve) => {
    const moreButton = document.getElementById('load_more_button');
    const moreDate = document.getElementById('load_more_button_continue_text');
    const stop = () => {
      stopTimerLoadMatchHistory();
      resolve();
    };
    if (moreButton && moreDate && moreDate.offsetParent !== null) {
      timerLoadMatchHistory = setInterval(() => {
        // if there is no date, it's because we reach the end of history (2017).
        if (moreDate.offsetParent === null) {
          stop();
        } else {
          const lastDate = moreDate.innerText.trim();
          updateStatus(`${status} ... [${lastDate}]`);

          // still loading
          if (moreButton.offsetParent !== null) {
            if (config.historyDate && config.historyDate >= lastDate) {
              stop();
            } else {
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
  toggleStopButton(stopLoadMatchHistoryButton, false);
}

async function displayBannedPlayers() {
  const bannedPlayersAfter = bannedPlayers
    .filter((bannedPlayer) => bannedPlayer.after)
    .sort((a, b) => (a.daySinceLastBan > b.daySinceLastBan ? 1 : a.daySinceLastBan < b.daySinceLastBan ? -1 : 0));

  bannedPlayersTable.textContent = '';
  if (bannedPlayersAfter.length) {
    bannedPlayersTable.appendChild(create('hr'));
    const table = create('table');
    bannedPlayersTable.appendChild(table);
    table.classList.add('players-banned-table');
    table.classList.add('csgo-history-table');
    const tableBody = create('tbody');
    table.appendChild(tableBody);

    const header = create('tr');
    tableBody.appendChild(header);

    const th1 = create('th');
    th1.textContent = 'Avatar';
    header.appendChild(th1);
    const th2 = create('th');
    th2.textContent = 'Name';
    header.appendChild(th2);
    const th3 = create('th');
    th3.textContent = 'Banned since';
    th3.classList.add('players-banned-date');
    header.appendChild(th3);
    const th4 = create('th');
    th4.textContent = 'Last played with on';
    th4.classList.add('players-banned-date');
    header.appendChild(th4);
    const th5 = create('th');
    th5.textContent = 'Profile link';
    th5.classList.add('players-banned-link');
    header.appendChild(th5);

    for (let bannedPlayer of bannedPlayersAfter) {
      const row = create('tr');
      tableBody.appendChild(row);

      const td1 = create('td');
      const img = create('img');
      td1.appendChild(img);
      img.src = bannedPlayer.profileAvatar;
      row.appendChild(td1);
      const td2 = create('td');
      td2.textContent = bannedPlayer.profileName;
      row.appendChild(td2);
      const td3 = create('td');
      td3.textContent = `${bannedPlayer.daySinceLastBan} days (~${getDateSince(bannedPlayer.daySinceLastBan)})`;
      row.appendChild(td3);
      const td4 = create('td');
      td4.textContent = `${bannedPlayer.daySinceLastMatch} days (${bannedPlayer.dateSinceLastMatch})`;
      row.appendChild(td4);
      const td5 = create('td');
      const link = create('a');
      td5.appendChild(link);
      link.target = '_blank';
      link.href = bannedPlayer.profileUrl;
      link.textContent = 'Link to profile';
      row.appendChild(td5);
    }
  }
}

function getDateSince(days) {
  const today = new Date();
  today.setDate(today.getDate() - days);
  const year = `${today.getFullYear()}`;
  const month = `${today.getMonth() + 1}`;
  const day = `${today.getDate()}`;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
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
    checkPeople();
  }
}
