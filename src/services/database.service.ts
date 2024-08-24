/// <reference types="chrome"/>
import { Injectable } from '@angular/core';
import { Database } from '../models';

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  async setDatabase(database: Database) {
    await chrome.storage.local.set(database);
  }

  async getDatabase() {
    return await chrome.storage.local.get();
  }
}
