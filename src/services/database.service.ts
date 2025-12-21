/// <reference types="chrome"/>
import { Injectable } from '@angular/core';
import { Database } from '../models';

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  async setDatabase(database: Database) {
    (await typeof chrome?.storage?.local) !== 'undefined' ? chrome.storage.local.set(database) : void 0;
  }

  async getDatabase() {
    return (await typeof chrome?.storage?.local) !== 'undefined' ? chrome.storage.local.get() : undefined;
  }
}
