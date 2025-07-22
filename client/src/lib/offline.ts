// Service de gestion du mode hors ligne
export class OfflineService {
  private static instance: OfflineService;
  private isOnline: boolean = navigator.onLine;
  private pendingRequests: Array<{
    id: string;
    url: string;
    method: string;
    headers: any;
    body: any;
    timestamp: number;
  }> = [];

  private constructor() {
    this.initializeOfflineMode();
  }

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  private initializeOfflineMode() {
    // Enregistre le service worker
    this.registerServiceWorker();

    // Écoute les changements de connexion
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingRequests();
      this.notifyOnlineStatus(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyOnlineStatus(false);
    });
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker enregistré:', registration);

        // Écoute les messages du service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'CACHE_UPDATED') {
            console.log('Cache mis à jour:', event.data.url);
          }
        });

      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
      }
    }
  }

  // Ajoute une requête à la queue hors ligne
  async addPendingRequest(url: string, method: string, headers: any, body: any) {
    const request = {
      id: this.generateId(),
      url,
      method,
      headers,
      body,
      timestamp: Date.now()
    };

    this.pendingRequests.push(request);
    await this.savePendingRequests();

    console.log('Requête ajoutée à la queue hors ligne:', request);
  }

  // Synchronise les requêtes en attente
  private async syncPendingRequests() {
    if (!this.isOnline || this.pendingRequests.length === 0) return;

    console.log('Synchronisation de', this.pendingRequests.length, 'requêtes en attente');

    const requestsToRemove: string[] = [];

    for (const request of this.pendingRequests) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body
        });

        if (response.ok) {
          requestsToRemove.push(request.id);
          console.log('Requête synchronisée:', request.url);
        }
      } catch (error) {
        console.error('Échec de synchronisation:', error);
      }
    }

    // Supprime les requêtes synchronisées
    this.pendingRequests = this.pendingRequests.filter(
      request => !requestsToRemove.includes(request.id)
    );

    await this.savePendingRequests();
  }

  // Sauvegarde les requêtes en attente dans IndexedDB
  private async savePendingRequests() {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['pending'], 'readwrite');
      const store = transaction.objectStore('pending');
      
      // Vide le store
      await store.clear();
      
      // Ajoute toutes les requêtes en attente
      for (const request of this.pendingRequests) {
        await store.add(request);
      }
      
      console.log('Requêtes en attente sauvegardées:', this.pendingRequests.length);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }

  // Ouvre la base de données IndexedDB
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CalygoFireDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('pending')) {
          const store = db.createObjectStore('pending', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains('sales')) {
          const store = db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Notifie l'application du changement de statut
  private notifyOnlineStatus(isOnline: boolean) {
    const event = new CustomEvent('onlineStatusChange', { detail: { isOnline } });
    window.dispatchEvent(event);
  }

  // Génère un ID unique
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Getters publics
  get online(): boolean {
    return this.isOnline;
  }

  get hasPendingRequests(): boolean {
    return this.pendingRequests.length > 0;
  }

  get pendingCount(): number {
    return this.pendingRequests.length;
  }
}

// Instance singleton
export const offlineService = OfflineService.getInstance();