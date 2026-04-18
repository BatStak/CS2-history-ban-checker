import { TestBed } from '@angular/core/testing';
import { SteamService } from './steam.service';
import { DataService } from './data.service';
import { DatabaseService } from './database.service';

describe('SteamService', () => {
  let service: SteamService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: DatabaseService, useValue: { setDatabase: vi.fn(), getDatabase: vi.fn() } },
      ],
    });
    service = TestBed.inject(SteamService);
    service.dataService.database.apiKey = 'test-key';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('scanPlayers', () => {
    it('calls Steam API and returns players', async () => {
      const mockPlayers = [{ SteamId: '123', NumberOfVACBans: 0 }];
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ players: mockPlayers }),
      } as Response);

      const result = await service.scanPlayers(['123']);
      expect(result).toEqual(mockPlayers);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('GetPlayerBans'));
    });

    it('rejects on HTTP error', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as Response);

      await expect(service.scanPlayers(['123'])).rejects.toThrow('Code 403');
    });
  });

  describe('getPlayerSummaries', () => {
    it('calls Steam API and returns summaries', async () => {
      const mockPlayers = [{ steamid: '123', personaname: 'Test' }];
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ response: { players: mockPlayers } }),
      } as Response);

      const result = await service.getPlayerSummaries(['123']);
      expect(result).toEqual(mockPlayers);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('GetPlayerSummaries'));
    });

    it('rejects on HTTP error', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(service.getPlayerSummaries(['123'])).rejects.toThrow('Code 500');
    });
  });
});
