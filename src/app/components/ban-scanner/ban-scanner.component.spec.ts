import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BanInfo, PlayerInfo } from '../../../models';
import { DataService } from '../../../services/data.service';
import { DatabaseService } from '../../../services/database.service';
import { SteamService } from '../../../services/steam.service';
import { UtilsService } from '../../../services/utils.service';
import { ScannerComponent } from './ban-scanner.component';

describe('ScannerComponent', async () => {
  let component: ScannerComponent;
  let dataService: DataService;
  let utilsService: UtilsService;
  let fixture: ComponentFixture<ScannerComponent>;
  let dom: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ScannerComponent],
      providers: [DatabaseService, UtilsService, DataService, SteamService],
    });
    fixture = TestBed.createComponent(ScannerComponent);
    component = fixture.componentInstance;
    utilsService = fixture.debugElement.injector.get(UtilsService);
    dataService = fixture.debugElement.injector.get(DataService);
    dom = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('Test "matches in database" display', async () => {
    component.isOnGCPDSection = true;
    fixture.detectChanges();
    expect(dom.textContent).toContain('matches in database for this section');

    component.isOnGCPDSection = false;
    fixture.detectChanges();
    expect(dom.textContent).not.toContain(
      'matches in database for this section'
    );
  });

  it('Test "not been scanned yet" display', async () => {
    dataService.playersNotScannedYet = [];
    fixture.detectChanges();
    expect(dom.textContent).not.toContain(
      'players that have not been scanned yet'
    );
    expect(dom.textContent).not.toContain('Scan new players');

    dataService.playersNotScannedYet = [{ matches: [], steamID64: 'test' }];
    fixture.detectChanges();
    expect(dom.textContent).toContain('players that have not been scanned yet');
    expect(dom.textContent).toContain('Scan new players');
  });

  it('Test "oldest match" display', async () => {
    dataService.oldestMatch = undefined;
    fixture.detectChanges();
    expect(dom.textContent).not.toContain('The oldest match is from');

    dataService.oldestMatch = {
      playersSteamID64: [],
    };
    fixture.detectChanges();
    expect(dom.textContent).toContain('The oldest match is from');
  });

  it('Test "oldest scan" display', async () => {
    dataService.oldestScan = undefined;
    fixture.detectChanges();
    expect(dom.textContent).not.toContain('The oldest scan has been on');

    dataService.oldestScan = {
      CommunityBanned: false,
      DaysSinceLastBan: 0,
      EconomyBan: '',
      NumberOfGameBans: 0,
      NumberOfVACBans: 0,
      SteamId: '',
      VACBanned: false,
      LastBanOn: '',
      LastFetch: '',
    };
    fixture.detectChanges();
    expect(dom.textContent).toContain('The oldest scan has been on');
  });

  it('Test page number with 50 players', async () => {
    const players: PlayerInfo[] = [];
    for (let i = 0; i < 50; i++) {
      players.push({ matches: [], steamID64: `steamId${i}` });
    }
    component._calcNumberOfPages(players);
    expect(component.numberOfPages).toEqual(1);
    utilsService.isScanning = true;
    fixture.detectChanges();
    expect(dom.textContent).toContain('Scanning (1/1)...');
  });

  it('Test page number with 100 players', async () => {
    const players: PlayerInfo[] = [];
    for (let i = 0; i < 100; i++) {
      players.push({ matches: [], steamID64: `steamId${i}` });
    }
    component._calcNumberOfPages(players);
    expect(component.numberOfPages).toEqual(1);
    utilsService.isScanning = true;
    fixture.detectChanges();
    expect(dom.textContent).toContain('Scanning (1/1)...');
  });

  it('Test page number with 101 players', async () => {
    const players: PlayerInfo[] = [];
    for (let i = 0; i < 101; i++) {
      players.push({ matches: [], steamID64: `steamId${i}` });
    }
    component._calcNumberOfPages(players);
    expect(component.numberOfPages).toEqual(2);
    utilsService.isScanning = true;
    fixture.detectChanges();
    expect(dom.textContent).toContain('Scanning (1/2)...');
  });

  it('Test page number with 1250 players', async () => {
    const players: PlayerInfo[] = [];
    for (let i = 0; i < 1250; i++) {
      players.push({ matches: [], steamID64: `steamId${i}` });
    }
    component._calcNumberOfPages(players);
    expect(component.numberOfPages).toEqual(13);
    utilsService.isScanning = true;
    fixture.detectChanges();
    expect(dom.textContent).toContain('Scanning (1/13)...');
  });

  it('Test doCheck', async () => {
    component.isOnGCPDSection = true;
    dataService.newPlayersBanned = false;
    component.ngDoCheck();
    fixture.detectChanges();
    expect(component.showNewPlayersBannedWarning).toBeFalse();
    expect(dom.textContent).not.toContain('There are new players banned');

    component.isOnGCPDSection = true;
    dataService.newPlayersBanned = true;
    component.ngDoCheck();
    fixture.detectChanges();
    expect(component.showNewPlayersBannedWarning).toBeTrue();
    expect(dom.textContent).toContain('There are new players banned');

    component.isOnGCPDSection = false;
    dataService.newPlayersBanned = true;
    component.ngDoCheck();
    fixture.detectChanges();
    expect(component.showNewPlayersBannedWarning).toBeFalse();
    expect(dom.textContent).not.toContain('There are new players banned');

    component.isOnGCPDSection = false;
    dataService.newPlayersBanned = false;
    component.ngDoCheck();
    fixture.detectChanges();
    expect(component.showNewPlayersBannedWarning).toBeFalse();
    expect(dom.textContent).not.toContain('There are new players banned');
  });

  it('Test deleted profiles', async () => {
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

  it('Test error display', async () => {
    component.error = 'Error detected';
    fixture.detectChanges();
    expect(dom.textContent).toContain('Error detected');
  });
});
