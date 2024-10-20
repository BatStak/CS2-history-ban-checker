import { MapNamePipe } from './mapName.pipe';

describe('MapNamePipe', async () => {
  it('Test MapNamePipe logic', async () => {
    const mapNamePipe = new MapNamePipe();

    expect(mapNamePipe.transform(undefined)).toEqual('');
    expect(mapNamePipe.transform('')).toEqual('');
    expect(mapNamePipe.transform(' ')).toEqual('');
    expect(mapNamePipe.transform('toto')).toEqual('Toto');
    expect(mapNamePipe.transform('tOTO')).toEqual('TOTO');
    expect(mapNamePipe.transform('de_dust2')).toEqual('Dust2');
    expect(mapNamePipe.transform('dedust2')).toEqual('Dedust2');
    expect(mapNamePipe.transform('cs_office')).toEqual('Office');
  });
});
