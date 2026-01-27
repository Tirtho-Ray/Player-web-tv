import { openDB } from 'idb';

const DB_NAME = 'BillboardCache';
const STORE_NAME = 'assets';

export const AssetManager = {
  async getDB() {
    return openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  },

  async getLocalUrl(id: string): Promise<string | null> {
    const db = await this.getDB();
    const blob = await db.get(STORE_NAME, id);
    return blob ? URL.createObjectURL(blob) : null;
  },

  async saveFile(id: string, url: string): Promise<string> {
    const db = await this.getDB();
    const response = await fetch(url);
    const blob = await response.blob();
    await db.put(STORE_NAME, blob, id);
    return URL.createObjectURL(blob);
  }
};