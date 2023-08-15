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

let profileURI = null;
let section = new URLSearchParams(window.location.search).get('tab');

const waitTimeRegex = /Wait Time\: (\d+)\:(\d+)/;
const matchTimeRegex = /Match Duration\: (\d+)\:(\d+)/;
const scoreRegex = /(\d+) : (\d+)/;
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

let timerLoadMatchHistory = null;
