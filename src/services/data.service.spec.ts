import { TestBed } from '@angular/core/testing';
import { DataService } from './data.service';
import { DatabaseService } from './database.service';
import { MatchFormat } from '../models';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: DatabaseService, useValue: { setDatabase: vi.fn(), getDatabase: vi.fn() } },
      ],
    });
    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPercentage', () => {
    it('calculates percentage correctly', () => {
      expect(service.getPercentage(1, 4)).toBe(25);
    });

    it('returns 0 when lower is 0', () => {
      expect(service.getPercentage(5, 0)).toBe(0);
    });

    it('rounds to 2 decimal places', () => {
      expect(service.getPercentage(1, 3)).toBe(33.33);
    });
  });

  describe('getWin', () => {
    it('returns 1 when team wins', () => {
      expect(service.getWin(16, 10)).toBe(1);
    });

    it('returns -1 when team loses', () => {
      expect(service.getWin(10, 16)).toBe(-1);
    });

    it('returns 0 on draw', () => {
      expect(service.getWin(15, 15)).toBe(0);
    });
  });

  describe('isOvertime', () => {
    it('returns true for MR12 when both teams >= 12', () => {
      expect(service.isOvertime(13, 12, MatchFormat.MR12)).toBe(true);
    });

    it('returns false for MR12 when a team < 12', () => {
      expect(service.isOvertime(13, 11, MatchFormat.MR12)).toBe(false);
    });

    it('returns false for non-MR12 formats', () => {
      expect(service.isOvertime(16, 15, MatchFormat.MR15)).toBe(false);
    });
  });

  describe('isFinished', () => {
    it('MR12: finished at 13-x', () => {
      expect(service.isFinished(13, 10, MatchFormat.MR12)).toBe(true);
    });

    it('MR12: draw at 15-15', () => {
      expect(service.isFinished(15, 15, MatchFormat.MR12)).toBe(true);
    });

    it('MR12: not finished at 12-10', () => {
      expect(service.isFinished(12, 10, MatchFormat.MR12)).toBe(false);
    });

    it('MR15: finished at 16-x', () => {
      expect(service.isFinished(16, 14, MatchFormat.MR15)).toBe(true);
    });

    it('MR15: draw at 15-15', () => {
      expect(service.isFinished(15, 15, MatchFormat.MR15)).toBe(true);
    });

    it('MR8: finished at 9-x', () => {
      expect(service.isFinished(9, 7, MatchFormat.MR8)).toBe(true);
    });

    it('MR8: draw at 8-8', () => {
      expect(service.isFinished(8, 8, MatchFormat.MR8)).toBe(true);
    });
  });

  describe('sortPlayers', () => {
    it('puts unscanned players first', () => {
      const a = { steamID64: '1', matches: [] };
      const b = { steamID64: '2', matches: [], banInfo: { LastFetch: '2024-01-01' } as any };
      expect(service.sortPlayers(a, b)).toBe(-1);
    });

    it('sorts scanned players by oldest fetch first', () => {
      const a = { steamID64: '1', matches: [], banInfo: { LastFetch: '2024-01-01' } as any };
      const b = { steamID64: '2', matches: [], banInfo: { LastFetch: '2024-02-01' } as any };
      expect(service.sortPlayers(a, b)).toBe(-1);
    });
  });

  describe('sortMatches', () => {
    it('sorts by date ascending', () => {
      const a = { id: '2024-01-01', playersSteamID64: [] };
      const b = { id: '2024-02-01', playersSteamID64: [] };
      expect(service.sortMatches(a, b)).toBe(-1);
    });
  });

  describe('sortBannedPlayers', () => {
    it('sorts by most recent ban first', () => {
      const a = { steamID64: '1', matches: [], banInfo: { LastBanOn: '2024-02-01' } as any };
      const b = { steamID64: '2', matches: [], banInfo: { LastBanOn: '2024-01-01' } as any };
      expect(service.sortBannedPlayers(a, b)).toBe(-1);
    });

    it('sorts by steamID when same ban date', () => {
      const a = { steamID64: '1', matches: [], banInfo: { LastBanOn: '2024-01-01' } as any };
      const b = { steamID64: '2', matches: [], banInfo: { LastBanOn: '2024-01-01' } as any };
      expect(service.sortBannedPlayers(a, b)).toBe(-1);
    });
  });

  describe('init', () => {
    it('initializes with default database', () => {
      service.init(undefined, 'matchhistorypremier', MatchFormat.MR12);
      expect(service.database.matches).toEqual([]);
      expect(service.database.players).toEqual([]);
      expect(service.section).toBe('matchhistorypremier');
      expect(service.format).toBe(MatchFormat.MR12);
    });

    it('initializes with provided database', () => {
      const db = { matches: [{ id: '1', playersSteamID64: [], section: 's' }], players: [] };
      service.init(db, 'matchhistorypremier', MatchFormat.MR12);
      expect(service.database.matches.length).toBe(1);
    });
  });

  describe('getBanTitle', () => {
    it('returns ban info string for banned player', () => {
      const player = {
        steamID64: '123',
        matches: [],
        banInfo: {
          SteamId: '123',
          NumberOfVACBans: 1,
          NumberOfGameBans: 2,
          DaysSinceLastBan: 30,
          LastBanOn: new Date(Date.now() - 30 * 86400000).toISOString(),
          LastFetch: new Date().toISOString(),
          CommunityBanned: false,
          EconomyBan: 'none',
          VACBanned: true,
        },
      };
      const title = service.getBanTitle(player);
      expect(title).toContain('1 VAC ban');
      expect(title).toContain('2 Game bans');
      expect(title).toContain('last ban was');
    });

    it('returns undefined for player without banInfo', () => {
      const player = { steamID64: '456', matches: [] };
      expect(service.getBanTitle(player)).toBeUndefined();
    });
  });
});
