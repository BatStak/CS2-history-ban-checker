import { TestBed } from '@angular/core/testing';
import { UtilsService } from './utils.service';

describe('UtilsService', () => {
  let service: UtilsService;

  beforeEach(() => {
    service = TestBed.inject(UtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSteamID64FromMiniProfileId', () => {
    it('converts miniprofile id to steamID64', () => {
      expect(service.getSteamID64FromMiniProfileId('123456789')).toBe('76561198083722517');
    });

    it('returns empty string for empty input', () => {
      expect(service.getSteamID64FromMiniProfileId('')).toBe('');
    });

    it('returns empty string for non-numeric input', () => {
      expect(service.getSteamID64FromMiniProfileId('abc')).toBe('');
    });
  });

  describe('wait', () => {
    it('resolves after specified time', async () => {
      const start = Date.now();
      await service.wait(50);
      expect(Date.now() - start).toBeGreaterThanOrEqual(40);
    });
  });

  describe('getMap', () => {
    it('extracts map name from match node', () => {
      const el = document.createElement('div');
      el.innerHTML = `<table class="csgo_scoreboard_inner_left"><tbody>
        <tr><td>Competitive de_dust2</td></tr>
      </tbody></table>`;
      expect(service.getMap(el)).toBe('de_dust2');
    });

    it('strips Premier prefix', () => {
      const el = document.createElement('div');
      el.innerHTML = `<table class="csgo_scoreboard_inner_left"><tbody>
        <tr><td>Premier de_inferno</td></tr>
      </tbody></table>`;
      expect(service.getMap(el)).toBe('de_inferno');
    });

    it('strips Wingman prefix', () => {
      const el = document.createElement('div');
      el.innerHTML = `<table class="csgo_scoreboard_inner_left"><tbody>
        <tr><td>Wingman de_nuke</td></tr>
      </tbody></table>`;
      expect(service.getMap(el)).toBe('de_nuke');
    });
  });

  describe('getDateOfMatch', () => {
    it('extracts date from match node', () => {
      const el = document.createElement('div');
      el.innerHTML = `<table class="csgo_scoreboard_inner_left"><tbody>
        <tr><td>map</td></tr>
        <tr><td>2024-01-15 14:30:00 GMT</td></tr>
      </tbody></table>`;
      expect(service.getDateOfMatch(el)).toBe('2024-01-15 14:30:00 GMT');
    });
  });

  describe('getHistoryPeriod', () => {
    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('sets startDate and endDate from DOM', () => {
      document.body.innerHTML = `
        <table class="csgo_scoreboard_root"><tbody>
          <tr><th>Header</th></tr>
          <tr><td><table class="csgo_scoreboard_inner_left"><tbody><tr><td>map</td></tr><tr><td>2024-01-01 00:00:00 GMT</td></tr></tbody></table></td></tr>
          <tr><td><table class="csgo_scoreboard_inner_left"><tbody><tr><td>map</td></tr><tr><td>2024-06-01 00:00:00 GMT</td></tr></tbody></table></td></tr>
        </tbody></table>`;
      service.getHistoryPeriod();
      expect(service.startDate).toBe('2024-06-01 00:00:00 GMT');
      expect(service.endDate).toBe('2024-01-01 00:00:00 GMT');
    });

    it('updates startDate if earlier date found', () => {
      service.startDate = '2024-06-01 00:00:00 GMT';
      document.body.innerHTML = `
        <table class="csgo_scoreboard_root"><tbody>
          <tr><th>Header</th></tr>
          <tr><td><table class="csgo_scoreboard_inner_left"><tbody><tr><td>map</td></tr><tr><td>2024-01-01 00:00:00 GMT</td></tr></tbody></table></td></tr>
        </tbody></table>`;
      service.getHistoryPeriod();
      expect(service.startDate).toBe('2024-01-01 00:00:00 GMT');
    });

    it('does not update endDate if already set', () => {
      service.endDate = '2024-12-01 00:00:00 GMT';
      document.body.innerHTML = `
        <table class="csgo_scoreboard_root"><tbody>
          <tr><th>Header</th></tr>
          <tr><td><table class="csgo_scoreboard_inner_left"><tbody><tr><td>map</td></tr><tr><td>2024-01-01 00:00:00 GMT</td></tr></tbody></table></td></tr>
        </tbody></table>`;
      service.getHistoryPeriod();
      expect(service.endDate).toBe('2024-12-01 00:00:00 GMT');
    });

    it('handles no matches in DOM', () => {
      service.startDate = undefined;
      service.endDate = undefined;
      service.getHistoryPeriod();
      expect(service.startDate).toBeUndefined();
      expect(service.endDate).toBeUndefined();
    });
  });

  describe('getReplayLink', () => {
    it('extracts replay link', () => {
      const el = document.createElement('div');
      el.innerHTML = `<a href="steam://replay/link"><div class="csgo_scoreboard_btn_gotv"></div></a>`;
      expect(service.getReplayLink(el)).toBe('steam://replay/link');
    });

    it('returns undefined when no replay link', () => {
      const el = document.createElement('div');
      expect(service.getReplayLink(el)).toBeUndefined();
    });
  });
});
