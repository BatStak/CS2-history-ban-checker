function genericOnClick(info) {
  switch (info.menuItemId) {
    case "premier-history":
      chrome.tabs.create({
        url: "https://steamcommunity.com/my/gcpd/730?tab=matchhistorypremier",
      });
      break;
    case "competitive-history":
      chrome.tabs.create({
        url: "https://steamcommunity.com/my/gcpd/730?tab=matchhistorycompetitivepermap",
      });
      break;
    case "wingman-history":
      chrome.tabs.create({
        url: "https://steamcommunity.com/my/gcpd/730?tab=matchhistorywingman",
      });
      break;
    case "scrimmage-history":
      chrome.tabs.create({
        url: "https://steamcommunity.com/my/gcpd/730?tab=matchhistoryscrimmage",
      });
      break;
    case "csgo-history":
      chrome.tabs.create({
        url: "https://steamcommunity.com/my/gcpd/730?tab=matchhistorycompetitive",
      });
      break;
    case "friends":
      chrome.tabs.create({
        url: "https://steamcommunity.com/my/friends",
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
  id: "competitive-history",
  title: "Access to Competitive history",
  contexts: ["all"],
});
chrome.contextMenus.create({
  id: "wingman-history",
  title: "Access to Wingman history",
  contexts: ["all"],
});
chrome.contextMenus.create({
  id: "scrimmage-history",
  title: "Access to Scrimmage history",
  contexts: ["all"],
});
chrome.contextMenus.create({
  id: "csgo-history",
  title: "Access to CSGO Matchmaking history",
  contexts: ["all"],
});
chrome.contextMenus.create({
  id: "friends",
  title: "Access to friends list",
  contexts: ["all"],
});
chrome.contextMenus.create({
  id: "github",
  title: "Github page",
  contexts: ["all"],
});

chrome.contextMenus.onClicked.addListener(genericOnClick);
