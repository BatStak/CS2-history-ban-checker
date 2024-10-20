import {
  ancientBase64,
  anubisBase64,
  assemblyBase64,
  cacheBase64,
  cbblBase64,
  dust2Base64,
  infernoBase64,
  italyBase64,
  mementoBase64,
  millsBase64,
  mirageBase64,
  nukeBase64,
  officeBase64,
  overpassBase64,
  theraBase64,
  trainBase64,
  vertigoBase64,
} from '../app/components/ban-statistics/maps.base64';
import { MapImagePipe } from './mapImage.pipe';

describe('MapImagePipe', async () => {
  it('Test MapImagePipe logic', async () => {
    const mapImagePipe = new MapImagePipe();

    expect(mapImagePipe.transform(undefined)).toEqual('');
    expect(mapImagePipe.transform('toto')).toEqual('');
    expect(mapImagePipe.transform('Ancient')).toEqual(ancientBase64);
    expect(mapImagePipe.transform('Anubis')).toEqual(anubisBase64);
    expect(mapImagePipe.transform('Dust II')).toEqual(dust2Base64);
    expect(mapImagePipe.transform('Inferno')).toEqual(infernoBase64);
    expect(mapImagePipe.transform('Mirage')).toEqual(mirageBase64);
    expect(mapImagePipe.transform('Nuke')).toEqual(nukeBase64);
    expect(mapImagePipe.transform('Overpass')).toEqual(overpassBase64);
    expect(mapImagePipe.transform('Vertigo')).toEqual(vertigoBase64);
    expect(mapImagePipe.transform('Office')).toEqual(officeBase64);
    expect(mapImagePipe.transform('Thera')).toEqual(theraBase64);
    expect(mapImagePipe.transform('Mills')).toEqual(millsBase64);
    expect(mapImagePipe.transform('Memento')).toEqual(mementoBase64);
    expect(mapImagePipe.transform('Assembly')).toEqual(assemblyBase64);
    expect(mapImagePipe.transform('Italy')).toEqual(italyBase64);
    expect(mapImagePipe.transform('Cache')).toEqual(cacheBase64);
    expect(mapImagePipe.transform('Train')).toEqual(trainBase64);
    expect(mapImagePipe.transform('Cobblestone')).toEqual(cbblBase64);
  });
});
