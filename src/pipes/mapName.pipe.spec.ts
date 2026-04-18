import { MapNamePipe } from './mapName.pipe';

describe('MapNamePipe', () => {
  const pipe = new MapNamePipe();

  it('removes de_ prefix and capitalizes', () => {
    expect(pipe.transform('de_dust2')).toBe('Dust2');
  });

  it('removes cs_ prefix and capitalizes', () => {
    expect(pipe.transform('cs_office')).toBe('Office');
  });

  it('capitalizes plain map name', () => {
    expect(pipe.transform('inferno')).toBe('Inferno');
  });

  it('returns empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('trims whitespace', () => {
    expect(pipe.transform('de_mirage ')).toBe('Mirage');
  });
});
