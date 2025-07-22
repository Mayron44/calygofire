import { storage } from "../storage";

// Boundaries for Sainte-Pazanne
const SAINTE_PAZANNE_BOUNDS = {
  north: 47.1200,
  south: 47.0800,
  east: -1.7800,
  west: -1.8400
};

interface OSMAddress {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    house_number?: string;
    road?: string;
    village?: string;
    town?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
}

export class AddressLoader {
  private static instance: AddressLoader;
  private readonly OVERPASS_API = "https://overpass-api.de/api/interpreter";
  private readonly NOMINATIM_API = "https://nominatim.openstreetmap.org";

  static getInstance(): AddressLoader {
    if (!AddressLoader.instance) {
      AddressLoader.instance = new AddressLoader();
    }
    return AddressLoader.instance;
  }

  /**
   * Load addresses from OpenStreetMap for Sainte-Pazanne
   */
  async loadAddressesFromOSM(): Promise<{ loaded: number; skipped: number; errors: number }> {
    const results = { loaded: 0, skipped: 0, errors: 0 };
    
    try {
      console.log("🔄 Chargement des adresses depuis OpenStreetMap...");
      
      // Query for residential addresses in Sainte-Pazanne
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["addr:housenumber"]["addr:street"]
            (${SAINTE_PAZANNE_BOUNDS.south},${SAINTE_PAZANNE_BOUNDS.west},${SAINTE_PAZANNE_BOUNDS.north},${SAINTE_PAZANNE_BOUNDS.east});
          way["addr:housenumber"]["addr:street"]
            (${SAINTE_PAZANNE_BOUNDS.south},${SAINTE_PAZANNE_BOUNDS.west},${SAINTE_PAZANNE_BOUNDS.north},${SAINTE_PAZANNE_BOUNDS.east});
        );
        out center;
      `;

      const response = await fetch(this.OVERPASS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(overpassQuery)}`
      });

      if (!response.ok) {
        throw new Error(`Erreur API Overpass: ${response.status}`);
      }

      const data = await response.json();
      const addresses = data.elements || [];

      console.log(`📍 ${addresses.length} adresses trouvées sur OpenStreetMap`);

      // Process each address
      for (const addr of addresses) {
        try {
          await this.processAddress(addr);
          results.loaded++;
        } catch (error) {
          console.error(`❌ Erreur lors du traitement de l'adresse:`, error);
          results.errors++;
        }
        
        // Add delay to respect rate limits
        await this.delay(100);
      }

      console.log(`✅ Chargement terminé: ${results.loaded} adresses ajoutées, ${results.skipped} ignorées, ${results.errors} erreurs`);
      return results;

    } catch (error) {
      console.error("❌ Erreur lors du chargement des adresses:", error);
      throw error;
    }
  }

  /**
   * Process a single address from OSM data
   */
  private async processAddress(osmAddr: any): Promise<void> {
    const tags = osmAddr.tags || {};
    const houseNumber = tags['addr:housenumber'];
    const street = tags['addr:street'];
    const postcode = tags['addr:postcode'] || '44680';
    const city = tags['addr:city'] || tags['addr:village'] || 'Sainte-Pazanne';

    if (!houseNumber || !street) {
      return; // Skip incomplete addresses
    }

    // Create full address string
    const fullAddress = `${houseNumber} ${street}, ${postcode} ${city}`;

    // Get coordinates
    let lat: number, lon: number;
    if (osmAddr.lat && osmAddr.lon) {
      lat = parseFloat(osmAddr.lat);
      lon = parseFloat(osmAddr.lon);
    } else if (osmAddr.center) {
      lat = osmAddr.center.lat;
      lon = osmAddr.center.lon;
    } else {
      return; // Skip addresses without coordinates
    }

    // Check if address already exists
    const existingAddresses = await storage.getAddresses();
    const exists = existingAddresses.some(addr => 
      addr.fullAddress.toLowerCase() === fullAddress.toLowerCase()
    );

    if (exists) {
      return; // Skip duplicates
    }

    // Create address record
    const addressData = {
      fullAddress,
      latitude: lat.toString(),
      longitude: lon.toString(),
      city,
      postalCode: postcode,
      status: 'unvisited' as const,
      notes: 'Chargé automatiquement depuis OpenStreetMap'
    };

    await storage.createAddress(addressData);
  }

  /**
   * Load specific sectors of Sainte-Pazanne
   */
  async loadSectorAddresses(sectorName: string): Promise<number> {
    console.log(`🔄 Chargement des adresses pour le secteur: ${sectorName}`);
    
    const sectorBounds = this.getSectorBounds(sectorName);
    if (!sectorBounds) {
      throw new Error(`Secteur inconnu: ${sectorName}`);
    }

    // Similar implementation but with sector-specific bounds
    // This would be used for more targeted loading
    return 0;
  }

  /**
   * Get geographic bounds for different sectors of Sainte-Pazanne
   */
  private getSectorBounds(sector: string) {
    const sectors = {
      'centre-ville': {
        north: 47.1050,
        south: 47.0950,
        east: -1.8050,
        west: -1.8150
      },
      'closeaux': {
        north: 47.1150,
        south: 47.1000,
        east: -1.7950,
        west: -1.8100
      },
      'bernardiere': {
        north: 47.1100,
        south: 47.0900,
        east: -1.7900,
        west: -1.8200
      }
    };

    return sectors[sector as keyof typeof sectors] || null;
  }

  /**
   * Geocode addresses that are missing coordinates
   */
  async geocodeMissingCoordinates(): Promise<{ updated: number; failed: number }> {
    const results = { updated: 0, failed: 0 };
    const addresses = await storage.getAddresses();

    for (const address of addresses) {
      if (!address.latitude || !address.longitude) {
        try {
          const coords = await this.geocodeAddress(address.fullAddress);
          if (coords) {
            await storage.updateAddress(address.id, {
              latitude: coords.lat.toString(),
              longitude: coords.lon.toString()
            });
            results.updated++;
          } else {
            results.failed++;
          }
        } catch (error) {
          console.error(`❌ Erreur géocodage pour ${address.fullAddress}:`, error);
          results.failed++;
        }
        
        // Rate limiting
        await this.delay(1000);
      }
    }

    return results;
  }

  /**
   * Geocode a single address using Nominatim
   */
  private async geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const response = await fetch(
        `${this.NOMINATIM_API}/search?format=json&q=${encodeURIComponent(address + ", Sainte-Pazanne, France")}&limit=1`
      );

      if (!response.ok) return null;

      const data = await response.json();
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
    } catch (error) {
      console.error("Erreur géocodage:", error);
    }
    
    return null;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const addressLoader = AddressLoader.getInstance();