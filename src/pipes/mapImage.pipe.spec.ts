import { MapImagePipe } from './mapImage.pipe';

describe('MapImagePipe', () => {
  const pipe = new MapImagePipe();

  it('returns a non-empty base64 string for known maps', () => {
    const knownMaps = [
      'Ancient', 'Anubis', 'Dust II', 'Inferno', 'Mirage', 'Nuke',
      'Overpass', 'Vertigo', 'Office', 'Thera', 'Mills', 'Memento',
      'Assembly', 'Italy', 'Cache', 'Train', 'Cobblestone',
    ];
    for (const map of knownMaps) {
      expect(pipe.transform(map)).toBeTruthy();
    }
  });

  it('returns empty string for unknown map', () => {
    expect(pipe.transform('de_unknown')).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });
});
