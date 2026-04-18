import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BanStatisticsComponent } from './ban-statistics.component';
import { DataService } from '../../../services/data.service';
import { SteamService } from '../../../services/steam.service';
import { DatabaseService } from '../../../services/database.service';
import { PlayerInfo } from '../../../models';

describe('BanStatisticsComponent', () => {
  let component: BanStatisticsComponent;
  let fixture: ComponentFixture<BanStatisticsComponent>;
  let dataService: DataService;
  let steamService: SteamService;

  const makeBanInfo = (id: string) => ({
    SteamId: id, NumberOfVACBans: 1, NumberOfGameBans: 0, DaysSinceLastBan: 30,
    LastBanOn: '2025-01-01', LastFetch: '2025-01-01', CommunityBanned: false, EconomyBan: 'none', VACBanned: true,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BanStatisticsComponent],
      providers: [
        { provide: DatabaseService, useValue: { setDatabase: vi.fn(), getDatabase: vi.fn() } },
        { provide: SteamService, useValue: { getPlayerSummaries: vi.fn().mockResolvedValue([]), scanPlayers: vi.fn().mockResolvedValue([]) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(BanStatisticsComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);
    steamService = TestBed.inject(SteamService);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('shows "No banned player" when empty', () => {
    expect(fixture.nativeElement.textContent).toContain('No banned player');
  });

  it('shows statistics when banned players exist', () => {
    const cheater: PlayerInfo = { steamID64: '200', matches: [], lastPlayWith: '2024-01-01', banInfo: makeBanInfo('200') as any };
    dataService.mySteamId = '100';
    dataService.filteredPlayers = [{ steamID64: '100', matches: [] }, cheater];
    dataService.filteredMatches = [{
      id: '2024-06-01 12:00:00 GMT', playersSteamID64: ['100', '200'],
      teamA: { scores: [{ steamID64: '100', ping: null, k: null, a: null, d: null, mvp: null, hsp: null, score: null }] },
      teamB: { scores: [{ steamID64: '200', ping: null, k: null, a: null, d: null, mvp: null, hsp: null, score: null }] },
    }];
    dataService.playersBannedFiltered = [cheater];
    dataService.oldestMatch = { id: '2024-01-01 00:00:00 GMT', playersSteamID64: [] };
    component.update();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('have been banned later');
    expect(fixture.nativeElement.textContent).toContain('played with later-banned');
    expect(fixture.nativeElement.textContent).toContain('Are you unlucky');
    expect(component.bannedCount).toBe(1);
    expect(component.matchesConcerned).toBe(1);
  });

  it('shows frequency of bans', () => {
    const cheater: PlayerInfo = { steamID64: '200', matches: [], banInfo: makeBanInfo('200') as any };
    dataService.playersBannedFiltered = [cheater];
    dataService.oldestMatch = { id: '2024-01-01 00:00:00 GMT', playersSteamID64: [] };
    component.getFrequencyBans(new Date('2024-07-01'));
    fixture.detectChanges();
    expect(component.frequencyInDaysOfBans).toBeGreaterThan(0);
  });

  it('does not compute frequency without oldest match', () => {
    dataService.playersBannedFiltered = [{ steamID64: '1', matches: [] } as any];
    dataService.oldestMatch = undefined;
    component.getFrequencyBans(new Date());
    expect(component.frequencyInDaysOfBans).toBe(-1);
  });

  it('calculateUnluckyStats with cheater on same team', () => {
    dataService.mySteamId = '100';
    dataService.playersBannedFiltered = [{ steamID64: '200', matches: [] } as any];
    component.matchesConcerned = 1;
    component.calculateUnluckyStats([{
      playersSteamID64: ['100', '200'],
      teamA: { scores: [{ steamID64: '100' }, { steamID64: '200' }] },
      teamB: { scores: [] },
    }] as any);
    expect(component.matchesWithCheaters).toBe(1);
    expect(component.matchesAgainstCheaters).toBe(0);
  });

  it('calculateUnluckyStats with cheater on opposing team', () => {
    dataService.mySteamId = '100';
    dataService.playersBannedFiltered = [{ steamID64: '200', matches: [] } as any];
    component.matchesConcerned = 1;
    component.calculateUnluckyStats([{
      playersSteamID64: ['100', '200'],
      teamA: { scores: [{ steamID64: '100' }] },
      teamB: { scores: [{ steamID64: '200' }] },
    }] as any);
    expect(component.matchesAgainstCheaters).toBe(1);
  });

  it('calculateUnluckyStats with cheaters on both teams', () => {
    dataService.mySteamId = '100';
    dataService.playersBannedFiltered = [{ steamID64: '200', matches: [] } as any, { steamID64: '100', matches: [] } as any];
    component.matchesConcerned = 1;
    component.calculateUnluckyStats([{
      playersSteamID64: ['100', '200'],
      teamA: { scores: [{ steamID64: '100' }] },
      teamB: { scores: [{ steamID64: '200' }] },
    }] as any);
    expect(component.matchesBothTeamsHasCheaters).toBe(1);
  });

  it('calculateUnluckyStats user in teamB against cheater in teamA', () => {
    dataService.mySteamId = '100';
    dataService.playersBannedFiltered = [{ steamID64: '200', matches: [] } as any];
    component.matchesConcerned = 1;
    component.calculateUnluckyStats([{
      playersSteamID64: ['100', '200'],
      teamA: { scores: [{ steamID64: '200' }] },
      teamB: { scores: [{ steamID64: '100' }] },
    }] as any);
    expect(component.matchesAgainstCheaters).toBe(1);
  });

  it('calculateUnluckyStats user in teamB with cheater in teamB', () => {
    dataService.mySteamId = '100';
    dataService.playersBannedFiltered = [{ steamID64: '200', matches: [] } as any];
    component.matchesConcerned = 1;
    component.calculateUnluckyStats([{
      playersSteamID64: ['100', '200'],
      teamA: { scores: [] },
      teamB: { scores: [{ steamID64: '100' }, { steamID64: '200' }] },
    }] as any);
    expect(component.matchesWithCheaters).toBe(1);
  });

  it('calculateUnluckyStats does nothing when matchesConcerned is 0', () => {
    component.matchesConcerned = 0;
    component.calculateUnluckyStats([]);
    expect(component.matchesAgainstCheaters).toBe(0);
  });

  it('unlucky is true when against > with by more than 5%', () => {
    dataService.mySteamId = '100';
    dataService.playersBannedFiltered = [{ steamID64: '200', matches: [] } as any];
    component.matchesConcerned = 10;
    // 10 matches all against
    const matches = Array.from({ length: 10 }, () => ({
      playersSteamID64: ['100', '200'],
      teamA: { scores: [{ steamID64: '100' }] },
      teamB: { scores: [{ steamID64: '200' }] },
    })) as any;
    component.calculateUnluckyStats(matches);
    expect(component.unlucky).toBe(true);
  });

  it('toggle list button works', () => {
    const cheater: PlayerInfo = { steamID64: '200', matches: [], banInfo: makeBanInfo('200') as any };
    dataService.playersBannedFiltered = [cheater];
    dataService.filteredPlayers = [cheater];
    component.update();
    fixture.detectChanges();

    const btn = Array.from(fixture.nativeElement.querySelectorAll('button')).find((b: any) => b.textContent.includes('Hide')) as HTMLButtonElement;
    expect(btn).toBeTruthy();
    btn.click();
    fixture.detectChanges();
    expect(component.displayListOfBannedPlayers).toBe(false);
  });

  it('updateSummaries fetches and updates player info', async () => {
    const cheater: PlayerInfo = { steamID64: '200', matches: [], banInfo: makeBanInfo('200') as any };
    dataService.playersBannedFiltered = [cheater];
    (steamService.getPlayerSummaries as any).mockResolvedValue([{ steamid: '200', personaname: 'Hacker', profileurl: 'url', avatarmedium: 'img' }]);
    vi.spyOn(dataService, 'save');

    await component.updateSummaries();
    expect(cheater.name).toBe('Hacker');
    expect(cheater.avatarLink).toBe('img');
    expect(component.summariesUpdatedOnce).toBe(true);
  });

  it('updateSummaries only runs once', async () => {
    component.summariesUpdatedOnce = true;
    await component.updateSummaries();
    expect(steamService.getPlayerSummaries).not.toHaveBeenCalled();
  });

  it('updateSummaries skips when no banned players', async () => {
    dataService.playersBannedFiltered = [];
    await component.updateSummaries();
    expect(steamService.getPlayerSummaries).not.toHaveBeenCalled();
  });

  it('unsubscribes on destroy', () => {
    const spy = vi.spyOn(component.onStatisticsUpdatedSubscription!, 'unsubscribe');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });
});
