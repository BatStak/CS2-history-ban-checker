import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ScannerComponent } from './ban-scanner.component';
import { DataService } from '../../../services/data.service';
import { SteamService } from '../../../services/steam.service';
import { UtilsService } from '../../../services/utils.service';
import { DatabaseService } from '../../../services/database.service';

describe('ScannerComponent', () => {
  let component: ScannerComponent;
  let fixture: ComponentFixture<ScannerComponent>;
  let dataService: DataService;
  let steamService: SteamService;
  let utilsService: UtilsService;

  async function detectChanges() {
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScannerComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: DatabaseService, useValue: { setDatabase: vi.fn(), getDatabase: vi.fn() } },
        { provide: SteamService, useValue: { scanPlayers: vi.fn().mockResolvedValue([]) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ScannerComponent);
    fixture.autoDetectChanges();
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);
    steamService = TestBed.inject(SteamService);
    utilsService = TestBed.inject(UtilsService);
    await detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('shows player/match counts', () => {
    expect(fixture.nativeElement.textContent).toContain('Players in database');
  });

  it('shows warning when playersNotScannedYet', async () => {
    dataService.playersNotScannedYet = [{ steamID64: '1', matches: [] }];
    await detectChanges();
    expect(fixture.nativeElement.textContent).toContain('not been scanned yet');
  });

  it('shows scan new players button when unscanned exist', async () => {
    dataService.playersNotScannedYet = [{ steamID64: '1', matches: [] }];
    await detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(Array.from(buttons).some((b: any) => b.textContent.includes('Scan new'))).toBe(true);
  });

  it('shows oldest match and scan info', async () => {
    dataService.oldestMatch = { id: '2024-01-01 00:00:00 GMT', playersSteamID64: [] };
    dataService.oldestScan = { LastFetch: '2024-02-01', SteamId: '1', LastBanOn: '', DaysSinceLastBan: 0, NumberOfVACBans: 0, NumberOfGameBans: 0, CommunityBanned: false, EconomyBan: 'none', VACBanned: false };
    await detectChanges();
    expect(fixture.nativeElement.textContent).toContain('oldest match');
    expect(fixture.nativeElement.textContent).toContain('oldest scan');
  });

  it('shows scanning progress', async () => {
    utilsService.isScanning = true;
    component.pageNumber = 0;
    component.numberOfPages = 3;
    await detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Scanning (1/3)');
  });

  it('shows error message', async () => {
    component.error = 'Something went wrong';
    await detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
  });

  it('shows list changed warning', async () => {
    dataService.listPlayersBannedChanged = true;
    component.ngDoCheck();
    await detectChanges();
    expect(fixture.nativeElement.textContent).toContain('list of banned players has changed');
  });

  it('_calcNumberOfPages', () => {
    component.calcNumberOfPages(new Array(250));
    expect(component.numberOfPages).toBe(3);
    component.calcNumberOfPages([]);
    expect(component.numberOfPages).toBe(0);
  });

  it('stopScan sets flag', () => {
    component.stopScan();
    expect(component.scanStopped).toBe(true);
  });

  it('handleDeletedProfiles marks missing players', () => {
    dataService.database.players = [{ steamID64: '1', matches: [] }, { steamID64: '2', matches: [] }];
    component.handleDeletedProfiles([{ SteamId: '1' }] as any, ['1', '2']);
    expect(dataService.database.players[1].deleted).toBe(true);
  });

  it('startScan scans new players', async () => {
    dataService.filteredPlayers = [
      { steamID64: '1', matches: [] },
      { steamID64: '2', matches: [], banInfo: { LastFetch: '2024-01-01' } as any },
    ];
    (steamService.scanPlayers as any).mockResolvedValue([{ SteamId: '1' }]);
    vi.spyOn(dataService, 'parseSteamResults');
    component.startScan('new');
    await vi.waitFor(() => expect(utilsService.isScanning).toBe(false));
    expect(dataService.parseSteamResults).toHaveBeenCalled();
  });

  it('startScan scans all players', async () => {
    dataService.filteredPlayers = [{ steamID64: '1', matches: [] }];
    (steamService.scanPlayers as any).mockResolvedValue([{ SteamId: '1' }]);
    vi.spyOn(dataService, 'parseSteamResults');
    component.startScan('all');
    await vi.waitFor(() => expect(utilsService.isScanning).toBe(false));
    expect(dataService.parseSteamResults).toHaveBeenCalled();
  });

  it('scanPlayers handles error', async () => {
    (steamService.scanPlayers as any).mockRejectedValue(new Error('fail'));
    vi.spyOn(console, 'error').mockImplementation(() => { });
    await component.scanPlayers([{ steamID64: '1', matches: [] }]);
    expect(component.error).toContain('Error');
    expect(utilsService.isScanning).toBe(false);
  });

  it('scanPlayers stops when scanStopped is true', async () => {
    (steamService.scanPlayers as any).mockResolvedValue([{ SteamId: '1' }]);
    vi.spyOn(dataService, 'parseSteamResults');
    component.scanStopped = true;
    component.numberOfPages = 2;
    await component.scanPlayers([{ steamID64: '1', matches: [] }]);
    expect(utilsService.isScanning).toBe(false);
  });

  it('scanPlayers stops when no players', async () => {
    await component.scanPlayers([]);
    expect(utilsService.isScanning).toBe(false);
  });

  it('ngDoCheck updates warning flag', () => {
    dataService.listPlayersBannedChanged = true;
    component.ngDoCheck();
    expect(component.showListBannedChangedWarning).toBe(true);
  });
});
