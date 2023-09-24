function updateFunStats() {
  if (isCommendOrReportsSection()) return;

  let selector = `.inner_name .playerAvatar a[href="${profileURI}"]:not(.${myProfileStatsCheckedClass})`;

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

function sortMapsStats(field) {
  if (sortMapStatsField !== field) {
    sortMapStatsOrder = 'asc';
  } else {
    sortMapStatsOrder = sortMapStatsOrder === 'asc' ? 'desc' : 'asc';
  }
  sortMapStatsField = field;
  updateGlobalStats();
}

function setSortMaps(header, field, ratioValue) {
  const func = (a, b) => (a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0);
  const funcWithRatio = (a, b) => (a[field] / a[ratioValue] > b[field] / b[ratioValue] ? 1 : a[field] / a[ratioValue] < b[field] / b[ratioValue] ? -1 : 0);
  replaceElt = header.lastChild || header;
  if (sortMapStatsOrder === 'asc') {
    replaceElt.textContent = `${replaceElt.textContent} ⇧`;
    if (ratioValue) {
      displayedMapsStats = mapsStats.sort((a, b) => funcWithRatio(a, b) || func(a, b));
    } else {
      displayedMapsStats = mapsStats.sort((a, b) => func(a, b));
    }
  } else {
    replaceElt.textContent = `${replaceElt.textContent} ⇩`;
    if (ratioValue) {
      displayedMapsStats = mapsStats.sort((a, b) => funcWithRatio(b, a) || func(b, a));
    } else {
      displayedMapsStats = mapsStats.sort((a, b) => func(b, a));
    }
  }
  return displayedMapsStats;
}

function updateGlobalStats() {
  if (!mapsStats.length) {
    return;
  }

  checkbansGlobalResults.textContent = '';

  const period = create('div', 'checkban-title');
  period.textContent = `Here are your results from ${startDate} to ${endDate}.`;
  checkbansGlobalResults.appendChild(period);

  const playerbaseTable = create('table');
  playerbaseTable.classList.add('csgo-history-table');
  const playerbaseTbody = create('tbody');
  playerbaseTable.appendChild(playerbaseTbody);
  const playerbaseHeaderRow = create('tr');
  const thPlayerbase1 = create('th');
  thPlayerbase1.textContent = 'Unique players';
  const thPlayerbase2 = create('th');
  thPlayerbase2.textContent = 'Banned';
  const thPlayerbase3 = create('th');
  thPlayerbase3.textContent = 'Banned after playing with you';
  playerbaseHeaderRow.appendChild(thPlayerbase1);
  playerbaseHeaderRow.appendChild(thPlayerbase2);
  playerbaseHeaderRow.appendChild(thPlayerbase3);
  playerbaseTbody.appendChild(playerbaseHeaderRow);
  const playerbaseRow = create('tr');
  const tdPlayerbase1 = create('td');
  tdPlayerbase1.textContent = playersList.length;
  const tdPlayerbase2 = create('td');
  tdPlayerbase2.textContent = checkBanStarted ? `${bannedPlayers.length} [${getPourcentage(bannedPlayers.length, playersList.length)} %]` : '?';
  const tdPlayerbase3 = create('td');
  tdPlayerbase3.classList.add('important');
  const playerbaseBannedAfterCount = bannedPlayers.filter((bannedPlayer) => bannedPlayer.after).length;
  tdPlayerbase3.textContent = checkBanStarted ? `${playerbaseBannedAfterCount} [${getPourcentage(playerbaseBannedAfterCount, playersList.length)} %]` : '?';
  playerbaseRow.appendChild(tdPlayerbase1);
  playerbaseRow.appendChild(tdPlayerbase2);
  playerbaseRow.appendChild(tdPlayerbase3);
  playerbaseTbody.appendChild(playerbaseRow);

  const mapsTable = create('table');
  mapsTable.classList.add('map-stats');
  mapsTable.classList.add('csgo-history-table');
  const mapsTbody = create('tbody');
  mapsTable.appendChild(mapsTbody);

  const mapsHeaderRow = create('tr');
  const mapsTh1 = create('th');
  mapsTh1.classList.add('map-name');
  const mapsTh2 = create('th');
  mapsTh2.classList.add('map-sample');
  const mapsTh3 = create('th');
  mapsTh3.classList.add('map-win');
  const mapsTh4 = create('th');
  mapsTh4.classList.add('map-draw');
  const mapsTh5 = create('th');
  mapsTh5.classList.add('map-lose');
  const mapsTh6 = create('th');
  mapsTh6.classList.add('map-ban');
  const mapsTh7 = create('th');
  mapsTh7.classList.add('map-ban-after');
  mapsHeaderRow.appendChild(mapsTh1);
  mapsHeaderRow.appendChild(mapsTh2);
  mapsHeaderRow.appendChild(mapsTh3);
  mapsHeaderRow.appendChild(mapsTh4);
  mapsHeaderRow.appendChild(mapsTh5);
  mapsHeaderRow.appendChild(mapsTh6);
  mapsHeaderRow.appendChild(mapsTh7);
  mapsTbody.appendChild(mapsHeaderRow);

  mapsTh1.textContent = 'Map';
  mapsTh1.onclick = () => sortMapsStats('name');
  mapsTh2.textContent = 'Sample';
  mapsTh2.onclick = () => sortMapsStats('count');
  mapsTh3.textContent = 'Win [%]';
  mapsTh3.onclick = () => sortMapsStats('wins');
  mapsTh4.textContent = 'Draw [%]';
  mapsTh4.onclick = () => sortMapsStats('draws');
  mapsTh5.textContent = 'Lose [%]';
  mapsTh5.onclick = () => sortMapsStats('loses');
  mapsTh6.textContent = 'With someone banned [%]';
  mapsTh6.onclick = () => sortMapsStats('bans');
  const text1 = create('div');
  text1.textContent = 'With someone banned';
  const text2 = create('div');
  text2.textContent = 'after playing with you [%]';
  mapsTh7.appendChild(text1);
  mapsTh7.appendChild(text2);
  mapsTh7.onclick = () => sortMapsStats('bansAfter');

  let total = {
    count: 0,
    wins: 0,
    draws: 0,
    loses: 0,
    bans: 0,
    bansAfter: 0,
  };

  let displayedMapsStats = [...mapsStats];
  switch (sortMapStatsField) {
    case 'name':
      displayedMapsStats = setSortMaps(mapsTh1, sortMapStatsField);
      break;
    case 'count':
      displayedMapsStats = setSortMaps(mapsTh2, sortMapStatsField);
      break;
    case 'wins':
      displayedMapsStats = setSortMaps(mapsTh3, sortMapStatsField, 'count');
      break;
    case 'draws':
      displayedMapsStats = setSortMaps(mapsTh4, sortMapStatsField, 'count');
      break;
    case 'loses':
      displayedMapsStats = setSortMaps(mapsTh5, sortMapStatsField, 'count');
      break;
    case 'bans':
      displayedMapsStats = setSortMaps(mapsTh6, sortMapStatsField, 'count');
      break;
    case 'bansAfter':
      displayedMapsStats = setSortMaps(mapsTh7, sortMapStatsField, 'count');
      break;
  }

  for (let map of displayedMapsStats) {
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
    mapsTbody.appendChild(mapRow);

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

  const totalMapsRow = create('tr');
  totalMapsRow.classList.add('map-total');
  const totalMapsTd1 = create('td');
  const totalMapsTd2 = create('td');
  const totalMapsTd3 = create('td');
  const totalMapsTd4 = create('td');
  const totalMapsTd5 = create('td');
  const totalMapsTd6 = create('td');
  const totalMapsTd7 = create('td');
  totalMapsTd7.classList.add('important');
  totalMapsRow.appendChild(totalMapsTd1);
  totalMapsRow.appendChild(totalMapsTd2);
  totalMapsRow.appendChild(totalMapsTd3);
  totalMapsRow.appendChild(totalMapsTd4);
  totalMapsRow.appendChild(totalMapsTd5);
  totalMapsRow.appendChild(totalMapsTd6);
  totalMapsRow.appendChild(totalMapsTd7);
  mapsTbody.appendChild(totalMapsRow);

  totalMapsTd1.textContent = 'Total';
  totalMapsTd2.textContent = total.count;
  totalMapsTd3.textContent = `${total.wins} [${getPourcentage(total.wins, total.count)} %]`;
  totalMapsTd4.textContent = `${total.draws} [${getPourcentage(total.draws, total.count)} %]`;
  totalMapsTd5.textContent = `${total.loses} [${getPourcentage(total.loses, total.count)} %]`;
  totalMapsTd6.textContent = checkBanStarted ? `${total.bans} [${getPourcentage(total.bans, total.count)} %]` : '?';
  totalMapsTd7.textContent = checkBanStarted ? `${total.bansAfter} [${getPourcentage(total.bansAfter, total.count)} %]` : '?';

  checkbansGlobalResults.appendChild(playerbaseTable);
  checkbansGlobalResults.appendChild(mapsTable);
}

function getDaysSinceAndUpdatePeriod(dateString) {
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

    if (!endDate) {
      endDate = formattedDate;
    }
    startDate = formattedDate;
  }

  return results;
}

function formatMatchsTable() {
  if (isCommendOrReportsSection()) {
    for (let report of document.querySelectorAll(`.generic_kv_table > tbody > tr:not(:first-child):not(.${playerFormattedClass})`)) {
      const dateEl = report.querySelector('td:first-child');
      const daysSinceMatch = getDaysSinceAndUpdatePeriod(dateEl.innerText).daysSinceMatch;
      const minProfileId = report.querySelector('.linkTitle').dataset.miniprofile;
      report.dataset.steamid64 = getSteamID64(minProfileId);
      report.dataset.dayssince = daysSinceMatch;
      report.classList.add(playerFormattedClass);
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

      const leftColumn = matchRow.querySelector('.csgo_scoreboard_inner_left');
      const results = getDaysSinceAndUpdatePeriod(leftColumn.innerText);
      rightPanel.querySelectorAll('tbody > tr').forEach((tr, i) => {
        if (i === 0 || tr.childElementCount < 3) return;
        const profileLink = tr.querySelector('.linkTitle');
        const minProfileId = profileLink.dataset.miniprofile;
        const steamid64 = getSteamID64(minProfileId);
        tr.dataset.steamid64 = steamid64;
        tr.dataset.dayssince = results.daysSinceMatch;
        tr.dataset.datesince = results.dateAsString;
        tr.dataset.matchindex = matchIndex;
        tr.classList.add(playerFormattedClass);
        addPlayer(steamid64);
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

function displayBanCheckResult(done) {
  const plural = banStats.recentBans > 1;
  updateResults([
    { text: done ? `Looks like we're done.` : 'Stopped !' },
    { text: '' },
    {
      text: `${banStats.vacBans} (${getPourcentage(banStats.vacBans, banStats.vacBans + banStats.gameBans)} %) VAC banned and ${banStats.gameBans} (${getPourcentage(
        banStats.gameBans,
        banStats.vacBans + banStats.gameBans
      )} %) Game banned players in games we scanned (a lot of these could happen outside of CS:GO.)`,
    },
    { text: '' },
    {
      text: `${plural ? `There were ` : `There is `}${banStats.recentBans} player${plural ? `s ` : ``} who got banned after playing with you (more likely to be on CS).`,
      important: banStats.recentBans > 0,
    },
  ]);
}

function checkBansOnApi(ids) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      chrome.runtime.id,
      {
        action: 'fetchBans',
        apikey: config.yourapikey,
        batch: ids,
      },
      (json, error) => {
        if (error || !json) {
          resolve(false);
        } else {
          for (let player of json.players) {
            playersToCheck.find((x) => x.steamid64 === player.SteamId).checked = true;
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
          setTimeout(() => {
            resolve(true);
          }, 500);
        }
      }
    );
  });
}

async function checkLoadedMatchesForBans() {
  checkBanStarted = true;
  stopCheckBan = false;
  toggleStopButton(stopCheckBansButton, true);
  disableAllButtons(true);

  playersToCheck = playersList.filter((x) => !x.checked);
  const maxPlayers = 100;

  let requestsCount = Math.floor(playersToCheck.length / 100);
  if (playersToCheck.length % maxPlayers !== 0) {
    requestsCount++;
  }

  for (let requestIndex = 0; requestIndex < requestsCount; requestIndex++) {
    updateResults([
      { text: `Loaded unchecked matches contain ${playersToCheck.length} players.` },
      { text: `We can scan ${maxPlayers} players at a time so we're sending ${requestsCount} request${requestsCount > 1 ? 's' : ''}` },
      { text: `${requestIndex} successful request${requestIndex <= 1 ? '' : 's'} so far...` },
    ]);
    const start = requestIndex * maxPlayers;
    const end = start + maxPlayers;
    const ids = playersToCheck.slice(start, end).map((x) => x.steamid64);

    let result = false;
    let retry = 0;
    while (retry < maxRetries && !result) {
      result = await checkBansOnApi(ids);
      if (!result) {
        updateResults(
          [
            {
              text: `Error while scanning players for bans: ${
                retry < maxRetries
                  ? `Retrying to scan... ${retry + 1}/${maxRetries}`
                  : `Couldn't scan for bans after ${maxRetries} retries. Are your sure you set a valid API key ?`
              }`,
              important: true,
            },
          ],
          true
        );
      }
      retry++;
    }

    updateGlobalStats();
    displayBannedPlayers();
    updatePeopleList();
    updateGroupMembersList();

    if (!result) {
      break;
    }

    if (stopCheckBan) {
      displayBanCheckResult(false);
      break;
    }
  }

  if (!stopCheckBan) {
    displayBanCheckResult(true);
  }
  disableAllButtons(false);
  toggleStopButton(stopCheckBansButton, false);
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

  checkbansPlayersList.textContent = '';
  if (bannedPlayersAfter.length) {
    const title = create('div', 'bancheck-title-players-list');
    checkbansPlayersList.appendChild(title);
    title.textContent = 'List of players banned after playing with you :';
    const table = create('table');
    checkbansPlayersList.appendChild(table);
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
  if (onGCPDSection()) {
    updateUI();

    if (!config.yourapikey) {
      loadMatchHistoryButton.disabled = checkBansButton.disabled = true;
      updateResults([{ text: `You must set your API key first ! Don't worry, this is easy. Just click on the button "Set API Key" !`, important: true }]);
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
    checkGroupMembers();
  }
}
