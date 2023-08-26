function checkPeople() {
  const people = [...document.querySelectorAll('.persona[data-steamid]')];
  if (people.length) {
    for (let profile of people) {
      profile.classList.add(profileToCheckClass);
      profile.dataset.steamid64 = profile.dataset.steamid;
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
