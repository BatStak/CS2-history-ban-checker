import { BanInfo, PlayerInfo } from '../../../models';
import { DataService } from '../../../services/data.service';
import { DatabaseService } from '../../../services/database.service';
import { SteamService } from '../../../services/steam.service';
import { UtilsService } from '../../../services/utils.service';
import { ScannerComponent } from './ban-scanner.component';

class MockUtilsService extends UtilsService {}

class MockDataService extends DataService {}

class MockSteamService extends SteamService {}

describe('ScannerComponent', () => {
  const utilsService = new MockUtilsService();
  const dataService = new MockDataService(new DatabaseService(), utilsService);
  const steamService = new MockSteamService(dataService);

  it('Test page number with 50 players', () => {
    const players: PlayerInfo[] = [];
    for (let i = 0; i < 50; i++) {
      players.push({ matches: [], steamID64: `steamId${i}` });
    }
    const comp = new ScannerComponent(utilsService, dataService, steamService);
    comp._calcNumberOfPages(players);
    expect(comp.numberOfPages).toEqual(1);
  });

  it('Test page number with 100 players', () => {
    const players: PlayerInfo[] = [];
    for (let i = 0; i < 100; i++) {
      players.push({ matches: [], steamID64: `steamId${i}` });
    }
    const comp = new ScannerComponent(utilsService, dataService, steamService);
    comp._calcNumberOfPages(players);
    expect(comp.numberOfPages).toEqual(1);
  });

  it('Test page number with 101 players', () => {
    const players: PlayerInfo[] = [];
    for (let i = 0; i < 101; i++) {
      players.push({ matches: [], steamID64: `steamId${i}` });
    }
    const comp = new ScannerComponent(utilsService, dataService, steamService);
    comp._calcNumberOfPages(players);
    expect(comp.numberOfPages).toEqual(2);
  });

  it('Test page number with 1250 players', () => {
    const players: PlayerInfo[] = [];
    for (let i = 0; i < 1250; i++) {
      players.push({ matches: [], steamID64: `steamId${i}` });
    }
    const comp = new ScannerComponent(utilsService, dataService, steamService);
    comp._calcNumberOfPages(players);
    expect(comp.numberOfPages).toEqual(13);
  });

  it('Test doCheck', () => {
    const comp = new ScannerComponent(utilsService, dataService, steamService);
    comp.isOnGCPDSection = true;
    dataService.newPlayersBanned = false;
    dataService.database.hideHistoryTable = false;
    comp.ngDoCheck();
    expect(comp.showNewPlayersBannedWarning).toBeFalse();

    comp.isOnGCPDSection = true;
    dataService.newPlayersBanned = true;
    dataService.database.hideHistoryTable = true;
    comp.ngDoCheck();
    expect(comp.showNewPlayersBannedWarning).toBeTrue();

    comp.isOnGCPDSection = true;
    dataService.newPlayersBanned = true;
    dataService.database.hideHistoryTable = undefined;
    comp.ngDoCheck();
    expect(comp.showNewPlayersBannedWarning).toBeFalse();

    comp.isOnGCPDSection = false;
    dataService.newPlayersBanned = true;
    dataService.database.hideHistoryTable = true;
    comp.ngDoCheck();
    expect(comp.showNewPlayersBannedWarning).toBeFalse();

    comp.isOnGCPDSection = false;
    dataService.newPlayersBanned = false;
    dataService.database.hideHistoryTable = true;
    comp.ngDoCheck();
    expect(comp.showNewPlayersBannedWarning).toBeFalse();
  });

  it('Test deleted profiles', () => {
    const comp = new ScannerComponent(utilsService, dataService, steamService);
    dataService.database.players = [
      {
        matches: [],
        steamID64: 'test',
      },
    ];
    const steamApiResults: BanInfo[] = [];
    const steamIdsScanned = ['test'];

    comp._handleDeletedProfiles(steamApiResults, steamIdsScanned);
    expect(steamApiResults.length).toEqual(0);
    expect(steamIdsScanned.length).toEqual(1);
    expect(dataService.database.players.length).toEqual(1);
    expect(dataService.database.players[0].deleted).toBeTrue();

    dataService.database.players = [
      {
        matches: [],
        steamID64: 'test',
      },
    ];
    steamApiResults.push({
      CommunityBanned: false,
      DaysSinceLastBan: 0,
      EconomyBan: '',
      LastBanOn: '',
      LastFetch: '',
      NumberOfGameBans: 0,
      NumberOfVACBans: 0,
      SteamId: 'test',
      VACBanned: false,
    });

    comp._handleDeletedProfiles(steamApiResults, steamIdsScanned);
    expect(steamApiResults.length).toEqual(1);
    expect(steamIdsScanned.length).toEqual(1);
    expect(dataService.database.players.length).toEqual(1);
    expect(dataService.database.players[0].deleted).toBeFalsy();
  });
});
