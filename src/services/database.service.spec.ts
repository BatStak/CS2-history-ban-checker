import { TestBed } from '@angular/core/testing';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(() => {
    (globalThis as any).chrome = undefined;
    service = TestBed.inject(DatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getDatabase returns undefined when chrome is unavailable', async () => {
    const result = await service.getDatabase();
    expect(result).toBeUndefined();
  });

  it('setDatabase does not throw when chrome is unavailable', async () => {
    await service.setDatabase({ matches: [], players: [] });
  });
});
