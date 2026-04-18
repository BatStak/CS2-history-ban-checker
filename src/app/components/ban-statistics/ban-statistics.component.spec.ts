import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BanStatisticsComponent } from './ban-statistics.component';
import { DataService } from '../../../services/data.service';
import { SteamService } from '../../../services/steam.service';
import { DatabaseService } from '../../../services/database.service';

describe('BanStatisticsComponent', () => {
  let component: BanStatisticsComponent;
  let fixture: ComponentFixture<BanStatisticsComponent>;
  let dataService: DataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BanStatisticsComponent],
      providers: [
        { provide: DatabaseService, useValue: { setDatabase: vi.fn(), getDatabase: vi.fn() } },
        {
          provide: SteamService,
          useValue: { getPlayerSummaries: vi.fn().mockResolvedValue([]), scanPlayers: vi.fn().mockResolvedValue([]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BanStatisticsComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows "No banned player" when no bans', () => {
    expect(fixture.nativeElement.textContent).toContain('No banned player');
  });

  it('update calculates stats correctly', () => {
    dataService.mySteamId = '100';
    dataService.filteredPlayers = [
      { steamID64: '100', matches: [] },
      { steamID64: '200', matches: [], banInfo: { SteamId: '200', NumberOfVACBans: 1, NumberOfGameBans: 0, LastBanOn: '2025-01-01', LastFetch: '2025-01-01', DaysSinceLastBan: 30, CommunityBanned: false, EconomyBan: 'none', VACBanned: true } },
    ];
    dataService.filteredMatches = [
      {
        id: '2024-06-01 12:00:00 GMT',
        playersSteamID64: ['100', '200'],
        teamA: { scores: [{ steamID64: '100', ping: null, k: null, a: null, d: null, mvp: null, hsp: null, score: null }] },
        teamB: { scores: [{ steamID64: '200', ping: null, k: null, a: null, d: null, mvp: null, hsp: null, score: null }] },
      },
    ];
    dataService.playersBannedFiltered = [dataService.filteredPlayers[1]];

    component.update();

    expect(component.playersCount).toBe(2);
    expect(component.bannedCount).toBe(1);
    expect(component.matchesCount).toBe(1);
    expect(component.matchesConcerned).toBe(1);
  });

  it('getFrequencyBans calculates frequency', () => {
    dataService.playersBannedFiltered = [{ steamID64: '1', matches: [] } as any, { steamID64: '2', matches: [] } as any];
    dataService.oldestMatch = { id: '2024-01-01 00:00:00 GMT', playersSteamID64: [] };
    component.update();

    const now = new Date('2024-07-01');
    component.getFrequencyBans(now);
    expect(component.frequencyInDaysOfBans).toBe(91); // ~182 days / 2 players
  });

  it('calculateUnluckyStats sets unlucky flag', () => {
    dataService.mySteamId = '100';
    dataService.playersBannedFiltered = [
      { steamID64: '200', matches: [], banInfo: { LastBanOn: '2025-01-01' } } as any,
    ];
    component.matchesConcerned = 1;

    const matchesWithBans = [{
      playersSteamID64: ['100', '200'],
      teamA: { scores: [{ steamID64: '100' }] },
      teamB: { scores: [{ steamID64: '200' }] },
    }] as any;

    component.calculateUnluckyStats(matchesWithBans);
    expect(component.matchesAgainstCheaters).toBe(1);
  });

  it('unsubscribes on destroy', () => {
    const spy = vi.spyOn(component.onStatisticsUpdatedSubscription!, 'unsubscribe');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });
});
