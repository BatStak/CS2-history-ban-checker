function checkPeople() {
  const people = [...document.querySelectorAll('.persona[data-steamid]')];
  if (people.length) {
    for (let profile of people) {
      profile.title = 'No ban for this player';
      const steamid64 = profile.dataset.steamid;
      profile.dataset.steamid64 = steamid64;
      addPlayer(steamid64);
    }
    checkLoadedMatchesForBans();
  }
}

function checkGroupMembers() {
  const people = [...document.querySelectorAll('#memberList .member_block[data-miniprofile]')];
  if (people.length) {
    for (let profile of people) {
      profile.title = 'No ban for this player';
      const steamid64 = getSteamID64(profile.dataset.miniprofile);
      profile.dataset.steamid64 = steamid64;
      const banStatus = create('div');
      banStatus.classList.add('group-member-ban-status');
      banStatus.textContent = '✓';
      profile.insertBefore(banStatus, profile.firstChild);
      addPlayer(steamid64);
    }
    checkLoadedMatchesForBans();
  }
}

function updatePeopleList() {
  for (let player of bannedPlayers) {
    const domElement = document.querySelector(`.persona[data-steamid="${player.steamid}"]`);
    if (domElement) {
      domElement.classList.add('people-banned');
      domElement.title = player.verdictPeople;
    }
  }
}

function updateGroupMembersList() {
  for (let player of bannedPlayers) {
    const domElement = document.querySelector(`#memberList .member_block[data-steamid64="${player.steamid}"]`);
    if (domElement) {
      domElement.classList.add('people-banned');
      domElement.title = player.verdictPeople;
      domElement.firstChild.textContent = 'Banned';
    }
  }
}
