import { Injectable } from '@angular/core';
import { Database } from '../models';
import { DataService } from './data.service';
import { DatabaseService } from './database.service';
import { UtilsService } from './utils.service';

@Injectable()
export class MockDatabaseService extends DatabaseService {
  override async getDatabase(): Promise<{ [key: string]: any }> {
    return {};
  }

  override async setDatabase(_database: Database): Promise<void> {
    return;
  }
}
describe('DataService', () => {
  let databaseService: DatabaseService;
  let utilsService: UtilsService;
  let dataService: DataService;

  beforeEach(() => {
    databaseService = new MockDatabaseService();
    utilsService = new UtilsService();
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
      }
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
      { id: '2024-02-17 19:47:55 GMT', playersSteamID64: [] }
    );

    matches.sort((a, b) => dataService._sortMatches(a, b));
    expect(matches.length).toEqual(3);
    expect(matches[0].id).toEqual('2024-02-15 19:47:55 GMT');
    expect(matches[1].id).toEqual('2024-02-16 19:47:55 GMT');
    expect(matches[2].id).toEqual('2024-02-17 19:47:55 GMT');
  });
});
