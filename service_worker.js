// chrome only
if (chrome.runtime.onInstalled) {
  chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
      id: 'match-history',
      title: 'Access to matchmaking history',
      contexts: ['all'],
    });
    chrome.contextMenus.create({
      id: 'github',
      title: 'Github page',
      contexts: ['all'],
    });
  });

  function genericOnClick(info) {
    switch (info.menuItemId) {
      case 'match-history':
        chrome.tabs.create({
          url: 'https://steamcommunity.com/my/gcpd/730?tab=matchhistorycompetitive',
        });
        break;
      case 'github':
        chrome.tabs.create({
          url: 'https://github.com/BatStak/CSGO-history-ban-checker',
        });
        break;
    }
  }

  chrome.contextMenus.onClicked.addListener(genericOnClick);
} else {
  // for firefox
  browser.contextMenus.create({
    id: 'match-history',
    title: 'Access to matchmaking history',
    contexts: ['all'],
  });
  chrome.contextMenus.create({
    id: 'github',
    title: 'Github page',
    contexts: ['all'],
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'fetchBans':
      fetch(`https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${request.apikey}&steamids=${request.batch.join(',')}`)
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            throw Error(`Code ${res.status}. ${res.statusText}`);
          }
        })
        .then((data) => sendResponse(data))
        .catch((error) => sendResponse(undefined, error));
      break;
  }
  return true;
});
