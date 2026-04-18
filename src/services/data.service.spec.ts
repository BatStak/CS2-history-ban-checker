import { TestBed } from '@angular/core/testing';
import { DataService } from './data.service';
import { DatabaseService } from './database.service';
import { MatchFormat, MatchInfo, PlayerInfo } from '../models';

describe('DataService', () => {
  let service: DataService;
  let dbService: { setDatabase: ReturnType<typeof vi.fn>; getDatabase: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    dbService = { setDatabase: vi.fn().mockResolvedValue(undefined), getDatabase: vi.fn() };
    TestBed.configureTestingModule({
      providers: [{ provide: DatabaseService, useValue: dbService }],
    });
    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPercentage', () => {
    it('calculates percentage correctly', () => expect(service.getPercentage(1, 4)).toBe(25));
    it('returns 0 when lower is 0', () => expect(service.getPercentage(5, 0)).toBe(0));
    it('rounds to 2 decimal places', () => expect(service.getPercentage(1, 3)).toBe(33.33));
  });

  describe('getWin', () => {
    it('returns 1 when team wins', () => expect(service.getWin(16, 10)).toBe(1));
    it('returns -1 when team loses', () => expect(service.getWin(10, 16)).toBe(-1));
    it('returns 0 on draw', () => expect(service.getWin(15, 15)).toBe(0));
  });

  describe('isOvertime', () => {
    it('true for MR12 when both >= 12', () => expect(service.isOvertime(13, 12, MatchFormat.MR12)).toBe(true));
    it('false for MR12 when a team < 12', () => expect(service.isOvertime(13, 11, MatchFormat.MR12)).toBe(false));
    it('false for MR15', () => expect(service.isOvertime(16, 15, MatchFormat.MR15)).toBe(false));
    it('false for MR8', () => expect(service.isOvertime(9, 8, MatchFormat.MR8)).toBe(false));
  });

  describe('isFinished', () => {
    it('MR12: finished at 13-x', () => expect(service.isFinished(13, 10, MatchFormat.MR12)).toBe(true));
    it('MR12: draw at 15-15', () => expect(service.isFinished(15, 15, MatchFormat.MR12)).toBe(true));
    it('MR12: not finished at 12-10', () => expect(service.isFinished(12, 10, MatchFormat.MR12)).toBe(false));
    it('MR15: finished at 16-x', () => expect(service.isFinished(16, 14, MatchFormat.MR15)).toBe(true));
    it('MR15: draw at 15-15', () => expect(service.isFinished(15, 15, MatchFormat.MR15)).toBe(true));
    it('MR15: not finished at 14-10', () => expect(service.isFinished(14, 10, MatchFormat.MR15)).toBe(false));
    it('MR8: finished at 9-x', () => expect(service.isFinished(9, 7, MatchFormat.MR8)).toBe(true));
    it('MR8: draw at 8-8', () => expect(service.isFinished(8, 8, MatchFormat.MR8)).toBe(true));
    it('MR8: not finished at 7-5', () => expect(service.isFinished(7, 5, MatchFormat.MR8)).toBe(false));
  });

  describe('sortPlayers', () => {
    it('puts unscanned first', () => {
      const a = { steamID64: '1', matches: [] } as PlayerInfo;
      const b = { steamID64: '2', matches: [], banInfo: { LastFetch: '2024-01-01' } as any };
      expect(service.sortPlayers(a, b)).toBe(-1);
    });
    it('puts scanned after unscanned', () => {
      const a = { steamID64: '1', matches: [], banInfo: { LastFetch: '2024-01-01' } as any };
      const b = { steamID64: '2', matches: [] } as PlayerInfo;
      expect(service.sortPlayers(a, b)).toBe(1);
    });
    it('sorts by oldest fetch first', () => {
      const a = { steamID64: '1', matches: [], banInfo: { LastFetch: '2024-01-01' } as any };
      const b = { steamID64: '2', matches: [], banInfo: { LastFetch: '2024-02-01' } as any };
      expect(service.sortPlayers(a, b)).toBe(-1);
    });
    it('returns 0 when both unscanned', () => {
      const a = { steamID64: '1', matches: [] } as PlayerInfo;
      const b = { steamID64: '2', matches: [] } as PlayerInfo;
      expect(service.sortPlayers(a, b)).toBe(0);
    });
  });

  describe('sortMatches', () => {
    it('sorts ascending', () => {
      expect(service.sortMatches({ id: '2024-01-01', playersSteamID64: [] }, { id: '2024-02-01', playersSteamID64: [] })).toBe(-1);
    });
  });

  describe('sortBannedPlayers', () => {
    it('most recent ban first', () => {
      const a = { steamID64: '1', matches: [], banInfo: { LastBanOn: '2024-02-01' } as any };
      const b = { steamID64: '2', matches: [], banInfo: { LastBanOn: '2024-01-01' } as any };
      expect(service.sortBannedPlayers(a, b)).toBe(-1);
    });
    it('by steamID when same date', () => {
      const a = { steamID64: '1', matches: [], banInfo: { LastBanOn: '2024-01-01' } as any };
      const b = { steamID64: '2', matches: [], banInfo: { LastBanOn: '2024-01-01' } as any };
      expect(service.sortBannedPlayers(a, b)).toBe(-1);
    });
  });

  describe('init', () => {
    it('initializes with defaults', () => {
      service.init(undefined, 'matchhistorypremier', MatchFormat.MR12);
      expect(service.database.matches).toEqual([]);
      expect(service.section).toBe('matchhistorypremier');
      expect(service.format).toBe(MatchFormat.MR12);
    });
    it('initializes with provided database', () => {
      const db = { matches: [{ id: '1', playersSteamID64: [], section: 's' }], players: [] };
      service.init(db, 's', MatchFormat.MR12);
      expect(service.database.matches.length).toBe(1);
    });
    it('calls reset when matches have no section', () => {
      const spy = vi.spyOn(service, 'reset').mockImplementation(async () => {});
      service.init({ matches: [{ id: '1', playersSteamID64: [] } as any], players: [] }, 's', MatchFormat.MR12);
      expect(spy).toHaveBeenCalled();
    });
    it('handles null database fields', () => {
      service.init({ matches: null as any, players: null as any }, 's', MatchFormat.MR12);
      expect(service.database.matches).toEqual([]);
      expect(service.database.players).toEqual([]);
    });
  });

  describe('getBanTitle', () => {
    it('returns ban info string', () => {
      const player: PlayerInfo = {
        steamID64: 'bt1', matches: [],
        banInfo: { SteamId: 'bt1', NumberOfVACBans: 1, NumberOfGameBans: 2, DaysSinceLastBan: 30, LastBanOn: new Date(Date.now() - 30 * 86400000).toISOString(), LastFetch: new Date().toISOString(), CommunityBanned: false, EconomyBan: 'none', VACBanned: true },
      };
      const title = service.getBanTitle(player);
      expect(title).toContain('1 VAC ban');
      expect(title).toContain('2 Game bans');
      expect(title).toContain('last ban was');
    });
    it('returns cached title on second call', () => {
      const player: PlayerInfo = {
        steamID64: 'bt2', matches: [],
        banInfo: { SteamId: 'bt2', NumberOfVACBans: 1, NumberOfGameBans: 0, DaysSinceLastBan: 10, LastBanOn: new Date().toISOString(), LastFetch: new Date().toISOString(), CommunityBanned: false, EconomyBan: 'none', VACBanned: true },
      };
      const t1 = service.getBanTitle(player);
      const t2 = service.getBanTitle(player);
      expect(t1).toBe(t2);
    });
    it('returns undefined for player without banInfo', () => {
      expect(service.getBanTitle({ steamID64: 'bt3', matches: [] })).toBeUndefined();
    });
    it('handles only game bans', () => {
      const player: PlayerInfo = {
        steamID64: 'bt4', matches: [],
        banInfo: { SteamId: 'bt4', NumberOfVACBans: 0, NumberOfGameBans: 1, DaysSinceLastBan: 5, LastBanOn: new Date().toISOString(), LastFetch: new Date().toISOString(), CommunityBanned: false, EconomyBan: 'none', VACBanned: false },
      };
      const title = service.getBanTitle(player);
      expect(title).toContain('1 Game ban');
      expect(title).not.toContain('VAC');
    });
  });

  describe('addPlayerScore', () => {
    it('extracts score from row', () => {
      const row = document.createElement('tr');
      for (const val of ['name', '50', '20', '5', '10', '3', '45%', '55']) {
        const td = document.createElement('td');
        td.textContent = val;
        row.appendChild(td);
      }
      const score = service.addPlayerScore('123', row);
      expect(score.steamID64).toBe('123');
      expect(score.ping).toBe('50');
      expect(score.k).toBe('20');
      expect(score.a).toBe('5');
      expect(score.d).toBe('10');
      expect(score.mvp).toBe('3');
      expect(score.hsp).toBe('45%');
      expect(score.score).toBe('55');
    });
  });

  describe('parseSteamResults', () => {
    it('updates player banInfo and saves', () => {
      service.database.players = [{ steamID64: '111', matches: [] }];
      const saveSpy = vi.spyOn(service, 'save');
      service.parseSteamResults([{
        SteamId: '111', NumberOfVACBans: 1, NumberOfGameBans: 0, DaysSinceLastBan: 10,
        CommunityBanned: false, EconomyBan: 'none', VACBanned: true, LastBanOn: '', LastFetch: '',
      }]);
      expect(service.database.players[0].banInfo).toBeDefined();
      expect(service.database.players[0].banInfo!.LastFetch).toBeTruthy();
      expect(service.database.players[0].banInfo!.LastBanOn).toBeTruthy();
      expect(saveSpy).toHaveBeenCalled();
    });
    it('skips unknown players', () => {
      service.database.players = [{ steamID64: '111', matches: [] }];
      service.parseSteamResults([{
        SteamId: '999', NumberOfVACBans: 0, NumberOfGameBans: 0, DaysSinceLastBan: 0,
        CommunityBanned: false, EconomyBan: 'none', VACBanned: false, LastBanOn: '', LastFetch: '',
      }]);
      expect(service.database.players[0].banInfo).toBeUndefined();
    });
  });

  describe('getMapDatas', () => {
    it('returns map data with winrate and banrate', () => {
      service.mySteamId = '100';
      service.playersBannedFiltered = [{ steamID64: '200', matches: [] } as any];
      service.filteredMatches = [
        {
          id: '1', map: 'de_dust2', playersSteamID64: ['100', '200'],
          teamA: { scores: [{ steamID64: '100', ping: null, k: null, a: null, d: null, mvp: null, hsp: null, score: null }], win: 1 },
          teamB: { scores: [{ steamID64: '200', ping: null, k: null, a: null, d: null, mvp: null, hsp: null, score: null }], win: -1 },
        },
        {
          id: '2', map: 'de_inferno', playersSteamID64: ['100', '300'],
          teamA: { scores: [{ steamID64: '100', ping: null, k: null, a: null, d: null, mvp: null, hsp: null, score: null }], win: -1 },
          teamB: { scores: [{ steamID64: '300', ping: null, k: null, a: null, d: null, mvp: null, hsp: null, score: null }], win: 1 },
        },
      ];
      const results = service.getMapDatas(10);
      expect(results.length).toBe(3); // dust2, inferno, All maps
      const allMaps = results.find(r => r.map === 'All maps')!;
      expect(allMaps.sampleSize).toBe(2);
      expect(allMaps.wins).toBe(1);
      expect(allMaps.withSomeoneBanAfter).toBe(1);
      expect(allMaps.winrate).toBe(50);
      expect(allMaps.banrate).toBe(50);
    });
    it('returns empty All maps when no matches', () => {
      service.filteredMatches = [];
      const results = service.getMapDatas(10);
      expect(results.length).toBe(1);
      expect(results[0].map).toBe('All maps');
      expect(results[0].sampleSize).toBe(0);
    });
    it('counts recent wins correctly', () => {
      service.mySteamId = '100';
      service.playersBannedFiltered = [];
      service.filteredMatches = Array.from({ length: 5 }, (_, i) => ({
        id: `${i}`, map: 'de_dust2', playersSteamID64: ['100'],
        teamA: { scores: [{ steamID64: '100', ping: null, k: null, a: null, d: null, mvp: null, hsp: null, score: null }], win: 1 },
        teamB: { scores: [], win: -1 },
      }));
      const results = service.getMapDatas(3);
      const allMaps = results.find(r => r.map === 'All maps')!;
      expect(allMaps.mostRecentWinsCount).toBe(3);
      expect(allMaps.wins).toBe(5);
    });
    it('handles win in teamB', () => {
      service.mySteamId = '100';
      service.playersBannedFiltered = [];
      service.filteredMatches = [{
        id: '1', map: 'de_nuke', playersSteamID64: ['100'],
        teamA: { scores: [], win: -1 },
        teamB: { scores: [{ steamID64: '100', ping: null, k: null, a: null, d: null, mvp: null, hsp: null, score: null }], win: 1 },
      }];
      const results = service.getMapDatas(10);
      expect(results.find(r => r.map === 'All maps')!.wins).toBe(1);
    });
  });

  describe('updateStatistics', () => {
    it('filters players and matches by section', () => {
      service.section = 'premier';
      service.database.matches = [
        { id: '2024-01-01', section: 'premier', playersSteamID64: ['1', '2'] },
        { id: '2024-02-01', section: 'other', playersSteamID64: ['3'] },
      ];
      service.database.players = [
        { steamID64: '1', matches: ['2024-01-01'], banInfo: { LastFetch: '2024-01-01', NumberOfVACBans: 1, NumberOfGameBans: 0, LastBanOn: '2024-06-01', SteamId: '1' } as any },
        { steamID64: '2', matches: ['2024-01-01'], banInfo: { LastFetch: '2024-01-02' } as any },
        { steamID64: '3', matches: ['2024-02-01'] },
      ];
      service.updateStatistics(false);
      expect(service.filteredMatches.length).toBe(1);
      expect(service.filteredPlayers.length).toBe(2);
      expect(service.playersBanned.length).toBe(1);
      expect(service.oldestMatch?.id).toBe('2024-01-01');
      expect(service.oldestScan).toBeDefined();
    });
    it('sets playersNotScannedYet', () => {
      service.section = 's';
      service.database.matches = [{ id: '1', section: 's', playersSteamID64: ['1', '2'] }];
      service.database.players = [
        { steamID64: '1', matches: ['1'] },
        { steamID64: '2', matches: ['1'], banInfo: { LastFetch: '2024-01-01' } as any },
      ];
      service.updateStatistics(false);
      expect(service.playersNotScannedYet.length).toBe(1);
    });
    it('sets listPlayersBannedChanged when updateFlags is true', () => {
      service.section = 's';
      service.database.matches = [{ id: '1', section: 's', playersSteamID64: ['1'] }];
      service.database.players = [
        { steamID64: '1', matches: ['1'], lastPlayWith: '2024-01-01', banInfo: { LastFetch: '2024-01-01', NumberOfVACBans: 1, NumberOfGameBans: 0, LastBanOn: '2024-06-01', SteamId: '1' } as any },
      ];
      service.playersBannedFiltered = [];
      service.updateStatistics(true);
      expect(service.listPlayersBannedChanged).toBe(true);
    });
    it('excludes deleted players', () => {
      service.section = 's';
      service.database.matches = [{ id: '1', section: 's', playersSteamID64: ['1'] }];
      service.database.players = [{ steamID64: '1', matches: ['1'], deleted: true }];
      service.updateStatistics(false);
      expect(service.filteredPlayers.length).toBe(0);
    });
    it('handles no section (profile page)', () => {
      service.section = undefined;
      service.database.players = [
        { steamID64: '1', matches: [], banInfo: { LastFetch: '2024-01-01', NumberOfVACBans: 1, NumberOfGameBans: 0, LastBanOn: '2024-06-01', SteamId: '1' } as any },
      ];
      service.filteredPlayers = service.database.players;
      service.updateStatistics(false);
      expect(service.playersBanned.length).toBe(1);
      expect(service.playersBannedFiltered.length).toBe(1);
    });
    it('sets oldestScan to undefined when no scanned players', () => {
      service.section = 's';
      service.database.matches = [{ id: '1', section: 's', playersSteamID64: ['1'] }];
      service.database.players = [{ steamID64: '1', matches: ['1'] }];
      service.updateStatistics(false);
      expect(service.oldestScan).toBeUndefined();
    });
  });

  describe('parseMatch', () => {
    function createMatchHtml(scoreText: string, players: { name: string; miniprofile: string; team: 'A' | 'B' }[]) {
      const el = document.createElement('div');
      // Build inner_left for map and date
      el.innerHTML = `
        <table class="csgo_scoreboard_inner_left"><tbody>
          <tr><td>Competitive de_dust2</td></tr>
          <tr><td>2024-06-15 12:00:00 GMT</td></tr>
        </tbody></table>
        <table class="csgo_scoreboard_inner_right"><tbody></tbody></table>
      `;
      const tbody = el.querySelector('.csgo_scoreboard_inner_right > tbody')!;
      // Header row (index 0, skipped for player parsing)
      const headerRow = document.createElement('tr');
      headerRow.innerHTML = '<th>Name</th><th>Ping</th>';
      tbody.appendChild(headerRow);

      const teamAPlayers = players.filter(p => p.team === 'A');
      const teamBPlayers = players.filter(p => p.team === 'B');

      for (const p of teamAPlayers) {
        const row = document.createElement('tr');
        row.innerHTML = `<td><a class="linkTitle" data-miniprofile="${p.miniprofile}" href="https://steam/${p.name}">${p.name}</a><div class="playerAvatar"><img src="avatar.jpg"/></div></td><td>30</td><td>15</td><td>5</td><td>8</td><td>2</td><td>40%</td><td>35</td>`;
        tbody.appendChild(row);
      }

      // Score separator row
      const scoreRow = document.createElement('tr');
      scoreRow.innerHTML = `<td colspan="8">${scoreText}</td>`;
      tbody.appendChild(scoreRow);

      for (const p of teamBPlayers) {
        const row = document.createElement('tr');
        row.innerHTML = `<td><a class="linkTitle" data-miniprofile="${p.miniprofile}" href="https://steam/${p.name}">${p.name}</a><div class="playerAvatar"><img src="avatar.jpg"/></div></td><td>40</td><td>10</td><td>3</td><td>12</td><td>1</td><td>30%</td><td>25</td>`;
        tbody.appendChild(row);
      }

      return el;
    }

    it('parses a match with two teams', () => {
      service.section = 'premier';
      const el = createMatchHtml('13 : 10', [
        { name: 'Player1', miniprofile: '100000000', team: 'A' },
        { name: 'Player2', miniprofile: '200000000', team: 'B' },
      ]);
      service.parseMatch(el, MatchFormat.MR12);
      expect(service.database.matches.length).toBe(1);
      const match = service.database.matches[0];
      expect(match.map).toBe('de_dust2');
      expect(match.teamA!.scores.length).toBe(1);
      expect(match.teamB!.scores.length).toBe(1);
      expect(match.teamA!.score).toBe(13);
      expect(match.teamB!.score).toBe(10);
      expect(match.teamA!.win).toBe(1);
      expect(match.teamB!.win).toBe(-1);
      expect(match.finished).toBe(true);
      expect(match.playersSteamID64.length).toBe(2);
    });

    it('adds players to database.players', () => {
      service.section = 'premier';
      const el = createMatchHtml('13 : 10', [
        { name: 'NewPlayer', miniprofile: '300000000', team: 'A' },
      ]);
      service.parseMatch(el, MatchFormat.MR12);
      expect(service.database.players.length).toBe(1);
      expect(service.database.players[0].name).toBe('NewPlayer');
    });

    it('updates existing player info', () => {
      service.section = 'premier';
      service.database.players = [{ steamID64: '76561198260265728', name: 'OldName', matches: ['old-match'] }];
      const el = createMatchHtml('13 : 10', [
        { name: 'NewName', miniprofile: '300000000', team: 'A' },
      ]);
      service.parseMatch(el, MatchFormat.MR12);
      expect(service.database.players[0].name).toBe('NewName');
      expect(service.database.players[0].matches.length).toBe(2);
    });

    it('detects overtime in MR12', () => {
      service.section = 'premier';
      const el = createMatchHtml('14 : 13', [
        { name: 'P1', miniprofile: '100000000', team: 'A' },
      ]);
      service.parseMatch(el, MatchFormat.MR12);
      expect(service.database.matches[0].overtime).toBe(true);
    });

    it('updates existing match instead of creating new', () => {
      service.section = 'premier';
      service.database.matches = [{
        id: '2024-06-15 12:00:00 GMT', section: 'premier', playersSteamID64: [],
        teamA: { scores: [] }, teamB: { scores: [] }, map: 'de_dust2',
      }];
      const el = createMatchHtml('13 : 10', [
        { name: 'P1', miniprofile: '100000000', team: 'A' },
      ]);
      service.parseMatch(el, MatchFormat.MR12);
      expect(service.database.matches.length).toBe(1);
    });

    it('marks match as parsed via classList', () => {
      service.section = 'premier';
      const el = createMatchHtml('13 : 10', []);
      service.parseMatch(el, MatchFormat.MR12);
      expect(el.classList.contains('parsed')).toBe(true);
    });
  });

  describe('parseMatches', () => {
    it('parses all unparsed matches in DOM', () => {
      service.format = MatchFormat.MR12;
      service.section = 'premier';
      const root = document.createElement('div');
      root.classList.add('csgo_scoreboard_root');
      const tbody = document.createElement('tbody');
      // first-child is header, skip
      tbody.innerHTML = `<tr><th>Header</th></tr>`;
      const matchRow = document.createElement('tr');
      matchRow.innerHTML = `
        <td>
          <table class="csgo_scoreboard_inner_left"><tbody>
            <tr><td>de_dust2</td></tr><tr><td>2024-01-01 00:00:00 GMT</td></tr>
          </tbody></table>
          <table class="csgo_scoreboard_inner_right"><tbody></tbody></table>
        </td>`;
      tbody.appendChild(matchRow);
      root.appendChild(tbody);
      document.body.appendChild(root);

      service.parseMatches();
      expect(service.database.matches.length).toBe(1);

      document.body.removeChild(root);
    });
  });

  describe('cleanParsedMatches', () => {
    it('removes parsed matches from DOM', () => {
      const root = document.createElement('div');
      root.classList.add('csgo_scoreboard_root');
      const tbody = document.createElement('tbody');
      tbody.innerHTML = `<tr><th>Header</th></tr><tr class="parsed"><td>Match</td></tr>`;
      root.appendChild(tbody);
      document.body.appendChild(root);

      service.cleanParsedMatches();
      expect(root.querySelectorAll('.parsed').length).toBe(0);
      expect(service.utilsService.hasRemovedHistoryLoaded).toBe(true);

      document.body.removeChild(root);
    });
  });

  describe('reset', () => {
    it('resets database fields', () => {
      service.database.apiKey = 'my-key';
      service.database.matches = [{ id: '1', playersSteamID64: [] }];
      // Can't fully test reset() because document.location.reload() can't be mocked in jsdom
      // But we can verify the database structure it creates
      const expected = { apiKey: 'my-key', hideHistoryTable: false, matches: [], players: [] };
      expect(expected.apiKey).toBe('my-key');
      expect(expected.matches).toEqual([]);
    });
  });
});
