import { Injectable } from '@angular/core';
import { Database, MatchFormat, PlayerInfo } from '../models';
import { DataService } from './data.service';
import { DatabaseService } from './database.service';
import { matchTable } from './match-table';
import { UtilsService } from './utils.service';

const matchId = '2024-02-18 13:57:31 GMT';

@Injectable()
export class MockDatabaseService extends DatabaseService {
  override async getDatabase(): Promise<{ [key: string]: any }> {
    return {};
  }

  override async setDatabase(_database: Database): Promise<void> {
    return;
  }
}

@Injectable()
export class MockUtilsService extends UtilsService {
  override getDateOfMatch(matchNode: HTMLElement): string | undefined {
    return matchId;
  }

  override getMap(matchNode: HTMLElement): string | undefined {
    return 'Vertigo';
  }

  override getReplayLink(matchNode: HTMLElement): string {
    return 'https://www.valvesoftware.com/';
  }
}

describe('DataService', () => {
  let databaseService: DatabaseService;
  let utilsService: UtilsService;
  let dataService: DataService;

  beforeEach(() => {
    databaseService = new MockDatabaseService();
    utilsService = new MockUtilsService();
    dataService = new DataService(databaseService, utilsService);
  });

  it('init', async () => {
    dataService.init();
    expect(dataService.database).toBeDefined();
    expect(dataService.database.matches).toBeDefined();
    expect(dataService.database.players).toBeDefined();
  });

  it('test sort players', async () => {
    dataService.init();
    expect(dataService.database).toBeDefined();
    expect(dataService.database.matches).toBeDefined();
    expect(dataService.database.players).toBeDefined();

    const players = dataService.database.players;
    players.push(
      {
        steamID64: 'noBanInfoA',
        matches: [],
      },
      {
        steamID64: 'banInfoA',
        banInfo: {
          CommunityBanned: false,
          DaysSinceLastBan: 0,
          EconomyBan: '',
          LastBanOn: '',
          LastFetch: '2024-05-10',
          NumberOfGameBans: 0,
          NumberOfVACBans: 0,
          SteamId: 'banInfoA',
          VACBanned: false,
        },
        matches: [],
      },
      {
        steamID64: 'banInfoB',
        banInfo: {
          CommunityBanned: false,
          DaysSinceLastBan: 0,
          EconomyBan: '',
          LastBanOn: '',
          LastFetch: '2024-05-09',
          NumberOfGameBans: 0,
          NumberOfVACBans: 0,
          SteamId: 'banInfoB',
          VACBanned: false,
        },
        matches: [],
      },
      {
        steamID64: 'noBanInfoB',
        matches: [],
      },
    );

    players.sort((a, b) => dataService._sortPlayers(a, b));
    expect(players.length).toEqual(4);
    expect(players[0].steamID64).toEqual('noBanInfoA');
    expect(players[1].steamID64).toEqual('noBanInfoB');
    expect(players[2].steamID64).toEqual('banInfoB');
    expect(players[3].steamID64).toEqual('banInfoA');
  });

  it('test sort matches', async () => {
    dataService.init();
    expect(dataService.database).toBeDefined();
    expect(dataService.database.matches).toBeDefined();
    expect(dataService.database.players).toBeDefined();

    const matches = dataService.database.matches;
    matches.push(
      { id: '2024-02-16 19:47:55 GMT', playersSteamID64: [] },
      { id: '2024-02-15 19:47:55 GMT', playersSteamID64: [] },
      { id: '2024-02-17 19:47:55 GMT', playersSteamID64: [] },
    );

    matches.sort((a, b) => dataService._sortMatches(a, b));
    expect(matches.length).toEqual(3);
    expect(matches[0].id).toEqual('2024-02-15 19:47:55 GMT');
    expect(matches[1].id).toEqual('2024-02-16 19:47:55 GMT');
    expect(matches[2].id).toEqual('2024-02-17 19:47:55 GMT');
  });

  it('test sort banned players', async () => {
    const players = dataService.playersBanned;

    players.push(
      {
        matches: [],
        steamID64: 'b',
        banInfo: {
          CommunityBanned: false,
          DaysSinceLastBan: 12,
          EconomyBan: '',
          LastBanOn: '',
          LastFetch: '',
          NumberOfGameBans: 0,
          NumberOfVACBans: 0,
          SteamId: '',
          VACBanned: false,
        },
      },
      {
        matches: [],
        steamID64: 'a',
        banInfo: {
          CommunityBanned: false,
          DaysSinceLastBan: 12,
          EconomyBan: '',
          LastBanOn: '',
          LastFetch: '',
          NumberOfGameBans: 0,
          NumberOfVACBans: 0,
          SteamId: '',
          VACBanned: false,
        },
      },
      {
        matches: [],
        steamID64: 'c',
        banInfo: {
          CommunityBanned: false,
          DaysSinceLastBan: 1,
          EconomyBan: '',
          LastBanOn: '',
          LastFetch: '',
          NumberOfGameBans: 0,
          NumberOfVACBans: 0,
          SteamId: '',
          VACBanned: false,
        },
      },
    );

    players.sort((a, b) => dataService._sortBannedPlayers(a, b));
    expect(players.length).toEqual(3);
    expect(players[0].steamID64).toEqual('c');
    expect(players[1].steamID64).toEqual('a');
    expect(players[2].steamID64).toEqual('b');
  });

  it('test parseMatch', async () => {
    const matches = dataService.database.matches;
    const players = dataService.database.players;
    const match = document.createElement('div');
    match.innerHTML = matchTable;

    dataService._parseMatch(match, MatchFormat.MR12);

    expect(matches).toBeDefined();
    expect(matches.length).toEqual(1);

    const matchInfo = matches[0];
    const player1 = utilsService.getSteamID64FromMiniProfileId('259535419');
    const player2 = utilsService.getSteamID64FromMiniProfileId('1131008354');
    const player3 = utilsService.getSteamID64FromMiniProfileId('1130737303');
    const player4 = utilsService.getSteamID64FromMiniProfileId('1932672');
    const player5 = utilsService.getSteamID64FromMiniProfileId('25001823');
    const player6 = utilsService.getSteamID64FromMiniProfileId('1193230280');
    const player7 = utilsService.getSteamID64FromMiniProfileId('128986650');
    const player8 = utilsService.getSteamID64FromMiniProfileId('197229280');
    const player9 = utilsService.getSteamID64FromMiniProfileId('161369610');
    const player10 = utilsService.getSteamID64FromMiniProfileId('81676977');

    const playersSteamIds = matchInfo.playersSteamID64;
    expect(matchInfo.id).toEqual(matchId);
    expect(matchInfo.teamA?.score).toEqual(13);
    expect(matchInfo.teamB?.score).toEqual(5);
    expect(playersSteamIds.some((steamId) => steamId === player1)).toBeTrue();
    expect(playersSteamIds.some((steamId) => steamId === player2)).toBeTrue();
    expect(playersSteamIds.some((steamId) => steamId === player3)).toBeTrue();
    expect(playersSteamIds.some((steamId) => steamId === player4)).toBeTrue();
    expect(playersSteamIds.some((steamId) => steamId === player5)).toBeTrue();
    expect(playersSteamIds.some((steamId) => steamId === player6)).toBeTrue();
    expect(playersSteamIds.some((steamId) => steamId === player7)).toBeTrue();
    expect(playersSteamIds.some((steamId) => steamId === player8)).toBeTrue();
    expect(playersSteamIds.some((steamId) => steamId === player9)).toBeTrue();
    expect(playersSteamIds.some((steamId) => steamId === player10)).toBeTrue();
    const playerInfo = players.find((playerInfo: PlayerInfo) => playerInfo.steamID64 === player1);
    expect(playerInfo).toBeDefined();
    expect(playerInfo?.avatarLink).toEqual(
      'https://avatars.akamai.steamstatic.com/b4f86a7202ee507b749724f6fe58ea6c40844465.jpg',
    );
    expect(playerInfo?.name).toEqual('PISSMYKISS');
    expect(playerInfo?.profileLink).toEqual('https://steamcommunity.com/id/PISSMYKISS666');
    expect(playerInfo?.matches?.length).toEqual(1);
    expect(playerInfo?.matches?.[0]).toEqual(matchInfo.id);
  });

  it('test _isFinished', async () => {
    let finished = dataService._isFinished(13, 5, MatchFormat.MR12);
    expect(finished).toBeTrue();
    finished = dataService._isFinished(15, 12, MatchFormat.MR12);
    expect(finished).toBeFalse();
    finished = dataService._isFinished(15, 15, MatchFormat.MR12);
    expect(finished).toBeTrue();
    finished = dataService._isFinished(12, 11, MatchFormat.MR12);
    expect(finished).toBeFalse();
    finished = dataService._isFinished(16, 14, MatchFormat.MR15);
    expect(finished).toBeTrue();
    finished = dataService._isFinished(15, 15, MatchFormat.MR15);
    expect(finished).toBeTrue();
    finished = dataService._isFinished(15, 14, MatchFormat.MR15);
    expect(finished).toBeFalse();
    finished = dataService._isFinished(8, 8, MatchFormat.MR8);
    expect(finished).toBeTrue();
    finished = dataService._isFinished(8, 7, MatchFormat.MR8);
    expect(finished).toBeFalse();
    finished = dataService._isFinished(9, 7, MatchFormat.MR8);
    expect(finished).toBeTrue();
  });

  it('test getMapDatas', async () => {
    dataService.mySteamId = 'playerId';
    dataService.playersBannedFiltered = [{ steamID64: 'cheaterId', matches: [] }];
    dataService.filteredMatches = [
      {
        map: 'dust2',
        teamA: {
          win: 1,
          scores: [
            { steamID64: 'playerId', ping: 'ping', a: 'a', d: 'd', hsp: 'hsp', k: 'k', mvp: 'mvp', score: 'score' },
          ],
        },
        teamB: {
          win: -1,
          scores: [
            { steamID64: 'otherId', ping: 'ping', a: 'a', d: 'd', hsp: 'hsp', k: 'k', mvp: 'mvp', score: 'score' },
          ],
        },
        playersSteamID64: ['playerId', 'otherId'],
      },
      {
        map: 'mirage',
        teamA: {
          win: -1,
          scores: [
            { steamID64: 'cheaterId', ping: 'ping', a: 'a', d: 'd', hsp: 'hsp', k: 'k', mvp: 'mvp', score: 'score' },
          ],
        },
        teamB: {
          win: 1,
          scores: [
            { steamID64: 'playerId', ping: 'ping', a: 'a', d: 'd', hsp: 'hsp', k: 'k', mvp: 'mvp', score: 'score' },
          ],
        },
        playersSteamID64: ['playerId', 'cheaterId'],
      },
      {
        map: 'mirage',
        teamA: {
          win: 0,
          scores: [
            { steamID64: 'otherId', ping: 'ping', a: 'a', d: 'd', hsp: 'hsp', k: 'k', mvp: 'mvp', score: 'score' },
          ],
        },
        teamB: {
          win: 0,
          scores: [
            { steamID64: 'playerId', ping: 'ping', a: 'a', d: 'd', hsp: 'hsp', k: 'k', mvp: 'mvp', score: 'score' },
          ],
        },
        playersSteamID64: ['playerId', 'otherId'],
      },
    ];
    const mapdatas = dataService.getMapDatas();
    expect(mapdatas.length).toEqual(3);
    expect(mapdatas[0].map).toEqual('All maps');
    expect(mapdatas[0].sampleSize).toEqual(3);
    expect(mapdatas[0].wins).toEqual(2);
    expect(mapdatas[0].withSomeoneBanAfter).toEqual(1);
    expect(mapdatas[0].winrate).toBeGreaterThan(66.66);
    expect(mapdatas[0].winrate).toBeLessThan(66.67);
    expect(mapdatas[0].banrate).toBeGreaterThan(33.33);
    expect(mapdatas[0].banrate).toBeLessThan(33.34);
    expect(mapdatas[1].map).toEqual('dust2');
    expect(mapdatas[1].sampleSize).toEqual(1);
    expect(mapdatas[1].wins).toEqual(1);
    expect(mapdatas[1].winrate).toEqual(100);
    expect(mapdatas[2].map).toEqual('mirage');
    expect(mapdatas[2].sampleSize).toEqual(2);
    expect(mapdatas[2].wins).toEqual(1);
    expect(mapdatas[2].withSomeoneBanAfter).toEqual(1);
    expect(mapdatas[2].winrate).toEqual(50);
    expect(mapdatas[2].banrate).toEqual(50);
  });
});
