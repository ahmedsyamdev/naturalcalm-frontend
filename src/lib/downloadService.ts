/**
 * Download Service
 * Manages offline track downloads using IndexedDB
 */

import { Track } from '@/types';

const DB_NAME = 'NaturacalmOffline';
const DB_VERSION = 1;
const TRACKS_STORE = 'tracks';
const AUDIO_STORE = 'audioFiles';

interface DownloadedTrack {
  track: Track;
  downloadedAt: Date;
  audioBlob: Blob;
  size: number;
}

class DownloadService {
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create tracks store
        if (!db.objectStoreNames.contains(TRACKS_STORE)) {
          const tracksStore = db.createObjectStore(TRACKS_STORE, { keyPath: 'id' });
          tracksStore.createIndex('downloadedAt', 'downloadedAt', { unique: false });
        }

        // Create audio files store
        if (!db.objectStoreNames.contains(AUDIO_STORE)) {
          db.createObjectStore(AUDIO_STORE, { keyPath: 'trackId' });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('Failed to initialize database');
    }
    return this.db;
  }

  /**
   * Download a track for offline playback
   */
  async downloadTrack(track: Track, audioUrl: string): Promise<void> {
    const db = await this.ensureDB();

    // Fetch the audio file with credentials for authenticated requests
    const response = await fetch(audioUrl, {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Accept': 'audio/*',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download track: ${response.status} ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const size = audioBlob.size;

    // Validate that we got actual audio data
    if (size === 0) {
      throw new Error('Downloaded file is empty');
    }

    const transaction = db.transaction([TRACKS_STORE, AUDIO_STORE], 'readwrite');

    // Store track metadata
    const tracksStore = transaction.objectStore(TRACKS_STORE);
    await tracksStore.put({
      id: track.id,
      track,
      downloadedAt: new Date(),
      size,
    });

    // Store audio file
    const audioStore = transaction.objectStore(AUDIO_STORE);
    await audioStore.put({
      trackId: track.id,
      blob: audioBlob,
    });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Check if a track is downloaded
   */
  async isTrackDownloaded(trackId: string): Promise<boolean> {
    const db = await this.ensureDB();
    const transaction = db.transaction([TRACKS_STORE], 'readonly');
    const store = transaction.objectStore(TRACKS_STORE);
    const request = store.get(trackId);

    return new Promise((resolve) => {
      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => resolve(false);
    });
  }

  /**
   * Get downloaded track audio URL
   */
  async getDownloadedTrackAudio(trackId: string): Promise<string | null> {
    const db = await this.ensureDB();
    const transaction = db.transaction([AUDIO_STORE], 'readonly');
    const store = transaction.objectStore(AUDIO_STORE);
    const request = store.get(trackId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        if (request.result) {
          const blob = request.result.blob;
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all downloaded tracks
   */
  async getDownloadedTracks(): Promise<Array<{ id: string; track: Track; downloadedAt: Date; size: number }>> {
    const db = await this.ensureDB();
    const transaction = db.transaction([TRACKS_STORE], 'readonly');
    const store = transaction.objectStore(TRACKS_STORE);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a downloaded track
   */
  async deleteTrack(trackId: string): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction([TRACKS_STORE, AUDIO_STORE], 'readwrite');

    const tracksStore = transaction.objectStore(TRACKS_STORE);
    tracksStore.delete(trackId);

    const audioStore = transaction.objectStore(AUDIO_STORE);
    audioStore.delete(trackId);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Get total storage used
   */
  async getStorageUsed(): Promise<number> {
    const tracks = await this.getDownloadedTracks();
    return tracks.reduce((total, t) => total + t.size, 0);
  }

  /**
   * Clear all downloads
   */
  async clearAllDownloads(): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction([TRACKS_STORE, AUDIO_STORE], 'readwrite');

    transaction.objectStore(TRACKS_STORE).clear();
    transaction.objectStore(AUDIO_STORE).clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

export const downloadService = new DownloadService();
