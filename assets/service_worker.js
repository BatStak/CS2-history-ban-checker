function genericOnClick(info) {
  switch (info.menuItemId) {
    case "premier-history":
      chrome.tabs.create({
        url: "https://steamcommunity.com/my/gcpd/730?tab=matchhistorypremier",
      });
      break;
    case "mm-history":
      chrome.tabs.create({
        url: "https://steamcommunity.com/my/gcpd/730?tab=matchhistorycompetitivepermap",
      });
      break;
    case "wingman-history":
      chrome.tabs.create({
        url: "https://steamcommunity.com/my/gcpd/730?tab=matchhistorywingman",
      });
      break;
    case "csgo-history":
      chrome.tabs.create({
        url: "https://steamcommunity.com/my/gcpd/730?tab=matchhistorycompetitive",
      });
      break;
    case "github":
      chrome.tabs.create({
        url: "https://github.com/BatStak/CS2-history-ban-checker",
      });
      break;
  }
}

chrome.contextMenus.removeAll();
chrome.contextMenus.create({
  id: "premier-history",
  title: "Access to Premier history",
  contexts: ["all"],
});
chrome.contextMenus.create({
  id: "mm-history",
  title: "Access to Matchmaking history",
  contexts: ["all"],
});
chrome.contextMenus.create({
  id: "wingman-history",
  title: "Access to Wingman history",
  contexts: ["all"],
});
chrome.contextMenus.create({
  id: "csgo-history",
  title: "Access to CSGO Matchmaking history",
  contexts: ["all"],
});
chrome.contextMenus.create({
  id: "github",
  title: "Github page",
  contexts: ["all"],
});

chrome.contextMenus.onClicked.addListener(genericOnClick);
