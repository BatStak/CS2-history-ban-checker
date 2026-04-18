import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BanListComponent } from './ban-list.component';
import { DataService } from '../../../services/data.service';
import { DatabaseService } from '../../../services/database.service';
import { Component } from '@angular/core';
import { PlayerInfo } from '../../../models';

const makeBanInfo = (id: string, banOn: string) => ({
  SteamId: id, NumberOfVACBans: 1, NumberOfGameBans: 0, DaysSinceLastBan: 30,
  LastBanOn: banOn, LastFetch: '2025-01-01', CommunityBanned: false, EconomyBan: 'none', VACBanned: true,
});

const makePlayer = (id: string, name: string, banOn: string, lastPlay: string): PlayerInfo => ({
  steamID64: id, name, profileLink: `https://steam/${id}`, avatarLink: `https://avatar/${id}`,
  lastPlayWith: lastPlay, matches: [], banInfo: makeBanInfo(id, banOn) as any,
});

@Component({
  template: `<cs2-history-ban-list [displayMatchInfo]="displayMatchInfo" [playersBanned]="players"></cs2-history-ban-list>`,
  imports: [BanListComponent],
})
class TestHostComponent {
  players: PlayerInfo[] = [];
  displayMatchInfo = true;
}

describe('BanListComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let dataService: DataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: DatabaseService, useValue: { setDatabase: vi.fn(), getDatabase: vi.fn() } }],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    dataService = TestBed.inject(DataService);
    fixture.detectChanges();
  });

  function getBanList(): BanListComponent {
    return fixture.debugElement.children[0].componentInstance;
  }

  it('should create', () => expect(getBanList()).toBeTruthy());

  it('renders table headers with match info columns', () => {
    const headers = fixture.nativeElement.querySelectorAll('th');
    const text = Array.from(headers).map((h: any) => h.textContent).join(' ');
    expect(text).toContain('Avatar');
    expect(text).toContain('Name');
    expect(text).toContain('See match');
    expect(text).toContain('Last played');
    expect(text).toContain('Last ban');
  });

  it('hides match info columns when displayMatchInfo is false', () => {
    host.displayMatchInfo = false;
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).not.toContain('See match');
    expect(text).not.toContain('Last played');
  });

  it('renders banned players', () => {
    host.players = [makePlayer('123', 'Cheater', '2025-01-01', '2024-06-01')];
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cheater');
  });

  it('orderBy name toggles', () => {
    const bl = getBanList();
    bl.orderBy('name');
    expect(bl.column).toBe('name');
    expect(bl.order).toBe('asc');
    bl.orderBy('name');
    expect(bl.order).toBe('desc');
  });

  it('orderBy LastBanOn sorts', () => {
    host.players = [
      makePlayer('1', 'A', '2025-01-01', '2024-01-01'),
      makePlayer('2', 'B', '2025-06-01', '2024-01-01'),
    ];
    fixture.detectChanges();
    const bl = getBanList();
    bl.orderBy('LastBanOn');
    expect(bl.playersBanned()[0].name).toBe('A');
    bl.orderBy('LastBanOn');
    expect(bl.playersBanned()[0].name).toBe('B');
  });

  it('orderBy lastPlayWith sorts', () => {
    host.players = [
      makePlayer('1', 'A', '2025-01-01', '2024-06-01'),
      makePlayer('2', 'B', '2025-01-01', '2024-01-01'),
    ];
    fixture.detectChanges();
    const bl = getBanList();
    bl.orderBy('lastPlayWith');
    expect(bl.playersBanned()[0].name).toBe('B');
  });

  it('showMatch and closeMatchInfo', () => {
    const bl = getBanList();
    const match = { id: '2024-01-01', playersSteamID64: [], teamA: { scores: [] }, teamB: { scores: [] } };
    dataService.filteredMatches = [match as any];
    bl.showMatch('2024-01-01', 0);
    expect(bl.matchInfo).toBe(match as any);
    bl.closeMatchInfo();
    expect(bl.matchInfo).toBeUndefined();
  });

  it('showMatch does nothing without matchId', () => {
    const bl = getBanList();
    bl.showMatch(undefined, 0);
    expect(bl.matchInfo).toBeUndefined();
  });

  it('show match button toggles match info display', () => {
    const match = {
      id: '2024-06-01', map: 'de_dust2', playersSteamID64: ['123'],
      teamA: { scores: [{ steamID64: '123', ping: '30', k: '15', a: '5', d: '8', mvp: '2', hsp: '40%', score: '35' }], score: 13 },
      teamB: { scores: [], score: 10 },
    };
    dataService.filteredMatches = [match as any];
    dataService.filteredPlayers = [makePlayer('123', 'Cheater', '2025-01-01', '2024-06-01')];
    dataService.playersBanned = [makePlayer('123', 'Cheater', '2025-01-01', '2024-06-01')];
    host.players = [makePlayer('123', 'Cheater', '2025-01-01', '2024-06-01')];
    fixture.detectChanges();

    const showBtn = fixture.nativeElement.querySelector('button');
    showBtn.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('13 : 10');

    // Click again to hide
    showBtn.click();
    fixture.detectChanges();
    expect(getBanList().matchInfo).toBeUndefined();
  });

  it('playerIsBanned returns correct value', () => {
    const bl = getBanList();
    dataService.playersBanned = [makePlayer('123', 'C', '2025-06-01', '2024-01-01')];
    expect(bl.playerIsBanned('123')).toBe(true);
  });

  it('getPlayerLink/Avatar/Name return correct values', () => {
    const bl = getBanList();
    dataService.filteredPlayers = [makePlayer('123', 'Test', '2025-01-01', '2024-01-01')];
    expect(bl.getPlayerLink('123')).toContain('123');
    expect(bl.getPlayerAvatar('123')).toContain('123');
    expect(bl.getPlayerName('123')).toBe('Test');
  });

  it('getBanTitle delegates to dataService', () => {
    const bl = getBanList();
    const player = makePlayer('123', 'Test', '2025-01-01', '2024-01-01');
    const title = bl.getBanTitle(player);
    expect(title).toContain('VAC ban');
  });
});
