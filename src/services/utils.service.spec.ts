import { oneMatch, threeMatches, twoMatches } from './match-table';
import { UtilsService } from './utils.service';

describe('UtilsService', () => {
  let service: UtilsService;
  const element = document.createElement('div');
  beforeEach(() => {
    service = new UtilsService();
  });

  it('test startdate and lastdate with 0 matches', async () => {
    service.getHistoryPeriod();
    expect(service.startDate).toBeUndefined();
    expect(service.endDate).toBeUndefined();
  });

  it('test startdate and lastdate with 3 matches', async () => {
    element.innerHTML = threeMatches;
    document.body.appendChild(element);
    service.getHistoryPeriod();
    expect(service.startDate).toEqual('2024-01-18 20:43:04 GMT');
    expect(service.endDate).toEqual('2024-02-11 12:58:15 GMT');
    document.body.removeChild(element);
  });

  it('test startdate and lastdate with 2 matches', async () => {
    element.innerHTML = twoMatches;
    document.body.appendChild(element);
    service.getHistoryPeriod();
    expect(service.startDate).toEqual('2024-01-18 20:43:04 GMT');
    expect(service.endDate).toEqual('2024-02-11 12:58:15 GMT');
    document.body.removeChild(element);
  });

  it('test startdate and lastdate with 1 matches', async () => {
    element.innerHTML = oneMatch;
    document.body.appendChild(element);
    service.getHistoryPeriod();
    expect(service.startDate).toEqual('2024-01-18 20:43:04 GMT');
    document.body.removeChild(element);
  });

  it('getSteamID64FromMiniProfileId with empty value', async () => {
    const result = service.getSteamID64FromMiniProfileId('');
    expect(result).toEqual('');
  });

  it('getSteamID64FromMiniProfileId with NAN value', async () => {
    const result = service.getSteamID64FromMiniProfileId('lol');
    expect(result).toEqual('');
  });

  it('getMap', async () => {
    const elt = document.createElement('div');
    let map: string | undefined;

    elt.innerHTML = '<div id="test"> Premier   dust2 </div>';
    service.mapCssSelector = '#test';
    map = service.getMap(elt);
    expect(map).toEqual('dust2');

    elt.innerHTML = '<div id="test"> Wingman   dust2 </div>';
    service.mapCssSelector = '#test';
    map = service.getMap(elt);
    expect(map).toEqual('dust2');

    elt.innerHTML = '<div id="test"> Competitive   dust2  </div>';
    service.mapCssSelector = '#test';
    map = service.getMap(elt);
    expect(map).toEqual('dust2');
  });

  it('getReplayLink', async () => {
    const elt = document.createElement('div');
    let replayLink: string | undefined;

    elt.innerHTML = '<a href="http://test.com/"><div class="csgo_scoreboard_btn_gotv"> Premier   dust2 </div></a>';
    replayLink = service.getReplayLink(elt);
    expect(replayLink).toEqual('http://test.com/');

    elt.innerHTML = '';
    replayLink = service.getReplayLink(elt);
    expect(replayLink).toBeUndefined();
  });
});
