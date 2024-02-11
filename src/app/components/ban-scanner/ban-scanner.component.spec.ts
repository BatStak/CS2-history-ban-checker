import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BanInfo, PlayerInfo } from '../../../models';
import { DataService } from '../../../services/data.service';
import { DatabaseService } from '../../../services/database.service';
import { SteamService } from '../../../services/steam.service';
import { UtilsService } from '../../../services/utils.service';
import { ScannerComponent } from './ban-scanner.component';

describe('ScannerComponent', () => {
  let component: ScannerComponent;
  let dataService: DataService;
  let fixture: ComponentFixture<ScannerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ScannerComponent],
      providers: [DatabaseService, UtilsService, DataService, SteamService],
    });
    fixture = TestBed.createComponent(ScannerComponent);
    component = fixture.componentInstance;
    dataService = fixture.debugElement.injector.get(DataService);
  });

  it('Test page number with 50 players', () => {
    const players: PlayerInfo[] = [];
    for (let i = 0; i < 50; i++) {
      players.push({ matches: [], steamID64: `steamId${i}` });
    }
    component._calcNumberOfPages(players);
    expect(component.numberOfPages).toEqual(1);
  });

  it('Test page number with 100 players', () => {
    const players: PlayerInfo[] = [];
    for (let i = 0; i < 100; i++) {
      players.push({ matches: [], steamID64: `steamId${i}` });
    }
    component._calcNumberOfPages(players);
    expect(component.numberOfPages).toEqual(1);
  });

  it('Test page number with 101 players', () => {
    const players: PlayerInfo[] = [];
    for (let i = 0; i < 101; i++) {
      players.push({ matches: [], steamID64: `steamId${i}` });
    }
    component._calcNumberOfPages(players);
    expect(component.numberOfPages).toEqual(2);
  });

  it('Test page number with 1250 players', () => {
    const players: PlayerInfo[] = [];
    for (let i = 0; i < 1250; i++) {
      players.push({ matches: [], steamID64: `steamId${i}` });
    }
    component._calcNumberOfPages(players);
    expect(component.numberOfPages).toEqual(13);
  });

  it('Test doCheck', () => {
    component.isOnGCPDSection = true;
    dataService.newPlayersBanned = false;
    dataService.database.hideHistoryTable = false;
    component.ngDoCheck();
    expect(component.showNewPlayersBannedWarning).toBeFalse();

    component.isOnGCPDSection = true;
    dataService.newPlayersBanned = true;
    dataService.database.hideHistoryTable = true;
    component.ngDoCheck();
    expect(component.showNewPlayersBannedWarning).toBeTrue();

    component.isOnGCPDSection = true;
    dataService.newPlayersBanned = true;
    dataService.database.hideHistoryTable = undefined;
    component.ngDoCheck();
    expect(component.showNewPlayersBannedWarning).toBeFalse();

    component.isOnGCPDSection = false;
    dataService.newPlayersBanned = true;
    dataService.database.hideHistoryTable = true;
    component.ngDoCheck();
    expect(component.showNewPlayersBannedWarning).toBeFalse();

    component.isOnGCPDSection = false;
    dataService.newPlayersBanned = false;
    dataService.database.hideHistoryTable = true;
    component.ngDoCheck();
    expect(component.showNewPlayersBannedWarning).toBeFalse();
  });

  it('Test deleted profiles', () => {
    dataService.database.players = [
      {
        matches: [],
        steamID64: 'test',
      },
    ];
    const steamApiResults: BanInfo[] = [];
    const steamIdsScanned = ['test'];

    component._handleDeletedProfiles(steamApiResults, steamIdsScanned);
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

    component._handleDeletedProfiles(steamApiResults, steamIdsScanned);
    expect(steamApiResults.length).toEqual(1);
    expect(steamIdsScanned.length).toEqual(1);
    expect(dataService.database.players.length).toEqual(1);
    expect(dataService.database.players[0].deleted).toBeFalsy();
  });
});
