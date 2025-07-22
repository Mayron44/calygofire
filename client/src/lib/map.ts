import L from "leaflet";

export interface GeocodeResult {
  lat: number;
  lon: number;
  display_name: string;
  place_id: string;
  importance: number;
}

export interface AddressComponents {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export class MapService {
  private static instance: MapService;
  private geocodeCache: Map<string, GeocodeResult[]> = new Map();
  private readonly NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
  private readonly OVERPASS_BASE_URL = "https://overpass-api.de/api/interpreter";

  static getInstance(): MapService {
    if (!MapService.instance) {
      MapService.instance = new MapService();
    }
    return MapService.instance;
  }

  /**
   * Geocode an address using Nominatim API with building-level precision
   */
  async geocodeAddress(address: string): Promise<GeocodeResult[]> {
    const cacheKey = address.toLowerCase().trim();
    
    if (this.geocodeCache.has(cacheKey)) {
      return this.geocodeCache.get(cacheKey)!;
    }

    try {
      // First try with building-level precision
      let response = await fetch(
        `${this.NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(address + ", Sainte-Pazanne")}&limit=3&countrycodes=fr&addressdetails=1&extratags=1&layer=address`
      );

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.statusText}`);
      }

      let results: GeocodeResult[] = await response.json();
      
      // If no building-level results, try with street-level precision
      if (results.length === 0) {
        response = await fetch(
          `${this.NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(address)}&limit=5&countrycodes=fr&addressdetails=1`
        );
        
        if (response.ok) {
          results = await response.json();
        }
      }
      
      // Cache the results
      this.geocodeCache.set(cacheKey, results);
      
      return results;
    } catch (error) {
      console.error("Geocoding error:", error);
      throw new Error("Impossible de géocoder l'adresse");
    }
  }

  /**
   * Reverse geocode coordinates to get address
   */
  async reverseGeocode(lat: number, lon: number): Promise<GeocodeResult | null> {
    try {
      const response = await fetch(
        `${this.NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return null;
    }
  }

  /**
   * Get addresses in a specific area using Overpass API
   */
  async getAddressesInArea(bounds: MapBounds): Promise<any[]> {
    const query = `
      [out:json][timeout:25];
      (
        way["addr:housenumber"]["addr:street"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        relation["addr:housenumber"]["addr:street"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      );
      out geom;
    `;

    try {
      const response = await fetch(this.OVERPASS_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        throw new Error(`Overpass API failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.elements || [];
    } catch (error) {
      console.error("Overpass API error:", error);
      throw new Error("Impossible de récupérer les adresses de la zone");
    }
  }

  /**
   * Parse address components from a geocoding result
   */
  parseAddressComponents(result: GeocodeResult): AddressComponents {
    const display_name = result.display_name;
    const parts = display_name.split(", ");
    
    return {
      street: parts[0] || "",
      city: parts.find(part => part.match(/^\d{5}/)) ? parts[parts.length - 3] : parts[parts.length - 4] || "",
      postalCode: parts.find(part => part.match(/^\d{5}/)) || "",
      country: parts[parts.length - 1] || "",
    };
  }

  /**
   * Create a custom marker icon based on status
   */
  createStatusMarker(status: string): L.DivIcon {
    const colors = {
      sold: "#4caf50",
      refused: "#f44336",
      revisit: "#ff9800",
      absent: "#9c27b0",
      unvisited: "#9e9e9e",
    };

    const color = colors[status as keyof typeof colors] || colors.unvisited;

    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        "></div>
      `,
      className: "custom-marker",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Optimize route using simple nearest neighbor algorithm
   */
  optimizeRoute(addresses: Array<{ lat: number; lon: number; id: number }>): number[] {
    if (addresses.length <= 1) return addresses.map(a => a.id);

    const optimized: number[] = [];
    const remaining = [...addresses];
    
    // Start with the first address
    let current = remaining.shift()!;
    optimized.push(current.id);

    while (remaining.length > 0) {
      // Find the nearest unvisited address
      let nearest = remaining[0];
      let nearestIndex = 0;
      let minDistance = this.calculateDistance(current.lat, current.lon, nearest.lat, nearest.lon);

      for (let i = 1; i < remaining.length; i++) {
        const distance = this.calculateDistance(current.lat, current.lon, remaining[i].lat, remaining[i].lon);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = remaining[i];
          nearestIndex = i;
        }
      }

      // Add nearest to optimized route and remove from remaining
      optimized.push(nearest.id);
      remaining.splice(nearestIndex, 1);
      current = nearest;
    }

    return optimized;
  }

  /**
   * Get bounds for Sainte-Pazanne area
   */
  getSaintePazanneBounds(): MapBounds {
    return {
      north: 47.12,
      south: 47.08,
      east: -1.83,
      west: -1.87,
    };
  }

  /**
   * Get center coordinates for Sainte-Pazanne
   */
  getSaintePazanneCenter(): [number, number] {
    return [47.1036, -1.8486];
  }

  /**
   * Validate coordinates
   */
  validateCoordinates(lat: number, lon: number): boolean {
    return (
      typeof lat === "number" &&
      typeof lon === "number" &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    );
  }

  /**
   * Get current location using browser geolocation
   */
  async getCurrentLocation(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000, // 10 minutes
        }
      );
    });
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Clear geocoding cache
   */
  clearCache(): void {
    this.geocodeCache.clear();
  }
}

export const mapService = MapService.getInstance();
