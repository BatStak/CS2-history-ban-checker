import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BanListComponent } from './ban-list.component';
import { DataService } from '../../../services/data.service';
import { DatabaseService } from '../../../services/database.service';
import { Component } from '@angular/core';
import { PlayerInfo } from '../../../models';

@Component({
  template: `<cs2-history-ban-list [displayMatchInfo]="true" [playersBanned]="players"></cs2-history-ban-list>`,
  imports: [BanListComponent],
})
class TestHostComponent {
  players: PlayerInfo[] = [];
}

describe('BanListComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: DatabaseService, useValue: { setDatabase: vi.fn(), getDatabase: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    const banList = fixture.debugElement.children[0].componentInstance as BanListComponent;
    expect(banList).toBeTruthy();
  });

  it('renders table headers', () => {
    const headers = fixture.nativeElement.querySelectorAll('th');
    expect(headers.length).toBeGreaterThan(0);
  });

  it('renders banned players', () => {
    host.players = [
      {
        steamID64: '123',
        name: 'Cheater',
        profileLink: 'https://steam',
        avatarLink: 'https://avatar',
        lastPlayWith: '2024-01-01',
        matches: [],
        banInfo: {
          SteamId: '123', NumberOfVACBans: 1, NumberOfGameBans: 0,
          LastBanOn: '2025-01-01', LastFetch: '2025-01-01',
          DaysSinceLastBan: 30, CommunityBanned: false, EconomyBan: 'none', VACBanned: true,
        },
      },
    ];
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cheater');
  });

  it('orderBy toggles sort order', () => {
    const banList = fixture.debugElement.children[0].componentInstance as BanListComponent;
    banList.orderBy('name');
    expect(banList.column).toBe('name');
    expect(banList.order).toBe('asc');

    banList.orderBy('name');
    expect(banList.order).toBe('desc');
  });

  it('showMatch sets matchInfo', () => {
    const banList = fixture.debugElement.children[0].componentInstance as BanListComponent;
    const dataService = TestBed.inject(DataService);
    const match = { id: '2024-01-01', playersSteamID64: [] };
    dataService.filteredMatches = [match as any];

    banList.showMatch('2024-01-01', 0);
    expect(banList.matchInfo).toBe(match as any);
    expect(banList.matchInfoIndex).toBe(0);
  });

  it('closeMatchInfo clears matchInfo', () => {
    const banList = fixture.debugElement.children[0].componentInstance as BanListComponent;
    banList.matchInfo = {} as any;
    banList.closeMatchInfo();
    expect(banList.matchInfo).toBeUndefined();
  });
});
