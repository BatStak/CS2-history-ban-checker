/// <reference types="chrome"/>
import { Injectable } from '@angular/core';
import { Database } from '../models';

@Injectable({ providedIn: 'root' })
export class DatabaseService {
    async setDatabase(database: Database) {
        if (typeof chrome?.storage?.local === 'undefined') {
            console.error("chrome.storage.local n'est pas disponible.");
            return;
        }
        await chrome.storage.local.set(database);
    }

    async getDatabase(): Promise<Database | undefined> {
        if (typeof chrome?.storage?.local === 'undefined') {
            console.error("chrome.storage.local n'est pas disponible.");
            return undefined;
        }
        return await chrome.storage.local.get(null) as Database;
    }
}
