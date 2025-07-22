import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { mapService, MapBounds, GeocodeResult } from "@/lib/map";
import { useToast } from "@/hooks/use-toast";

interface MapState {
  center: [number, number];
  zoom: number;
  bounds?: MapBounds;
}

interface UseMapOptions {
  initialCenter?: [number, number];
  initialZoom?: number;
  enableGeolocation?: boolean;
  autoFetchAddresses?: boolean;
}

export function useMap(options: UseMapOptions = {}) {
  const { toast } = useToast();
  const [mapState, setMapState] = useState<MapState>({
    center: options.initialCenter || mapService.getSaintePazanneCenter(),
    zoom: options.initialZoom || 13,
  });
  const [isGeolocationEnabled, setIsGeolocationEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Get current location on mount if enabled
  useEffect(() => {
    if (options.enableGeolocation) {
      getCurrentLocation();
    }
  }, [options.enableGeolocation]);

  const getCurrentLocation = useCallback(async () => {
    try {
      const location = await mapService.getCurrentLocation();
      setCurrentLocation(location);
      setIsGeolocationEnabled(true);
      setMapState(prev => ({
        ...prev,
        center: [location.lat, location.lon],
      }));
    } catch (error) {
      console.error("Failed to get current location:", error);
      toast({
        title: "Localisation impossible",
        description: "Impossible d'obtenir votre position actuelle",
        variant: "destructive",
      });
    }
  }, [toast]);

  const centerOnSaintePazanne = useCallback(() => {
    setMapState(prev => ({
      ...prev,
      center: mapService.getSaintePazanneCenter(),
      zoom: 13,
    }));
  }, []);

  const setCenter = useCallback((lat: number, lon: number, zoom?: number) => {
    setMapState(prev => ({
      ...prev,
      center: [lat, lon],
      zoom: zoom || prev.zoom,
    }));
  }, []);

  const setBounds = useCallback((bounds: MapBounds) => {
    setMapState(prev => ({
      ...prev,
      bounds,
    }));
  }, []);

  return {
    mapState,
    setCenter,
    setBounds,
    centerOnSaintePazanne,
    getCurrentLocation,
    currentLocation,
    isGeolocationEnabled,
  };
}

export function useGeocode(address: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["/api/geocode", address],
    queryFn: async () => {
      if (!address || address.length < 3) return [];
      return await mapService.geocodeAddress(address);
    },
    enabled: enabled && !!address && address.length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useReverseGeocode(lat: number, lon: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["/api/reverse-geocode", lat, lon],
    queryFn: async () => {
      if (!mapService.validateCoordinates(lat, lon)) return null;
      return await mapService.reverseGeocode(lat, lon);
    },
    enabled: enabled && mapService.validateCoordinates(lat, lon),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

export function useAddressesInArea(bounds: MapBounds | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ["/api/addresses-in-area", bounds],
    queryFn: async () => {
      if (!bounds) return [];
      return await mapService.getAddressesInArea(bounds);
    },
    enabled: enabled && !!bounds,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
  });
}

export function useRouteOptimization() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();

  const optimizeRoute = useCallback(async (addresses: Array<{ lat: number; lon: number; id: number }>) => {
    if (addresses.length <= 1) return addresses.map(a => a.id);

    setIsOptimizing(true);
    
    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const optimizedOrder = mapService.optimizeRoute(addresses);
      
      toast({
        title: "Tournée optimisée",
        description: `Ordre de passage optimisé pour ${addresses.length} adresses`,
      });
      
      return optimizedOrder;
    } catch (error) {
      toast({
        title: "Erreur d'optimisation",
        description: "Impossible d'optimiser la tournée",
        variant: "destructive",
      });
      return addresses.map(a => a.id);
    } finally {
      setIsOptimizing(false);
    }
  }, [toast]);

  return {
    optimizeRoute,
    isOptimizing,
  };
}

export function useAddressValidation() {
  const [isValidating, setIsValidating] = useState(false);
  
  const validateAddress = useCallback(async (address: string): Promise<{ isValid: boolean; suggestion?: string }> => {
    if (!address || address.length < 3) {
      return { isValid: false };
    }

    setIsValidating(true);
    
    try {
      const results = await mapService.geocodeAddress(address);
      
      if (results.length === 0) {
        return { isValid: false };
      }

      const bestResult = results[0];
      const suggestion = bestResult.display_name;
      
      return {
        isValid: true,
        suggestion,
      };
    } catch (error) {
      return { isValid: false };
    } finally {
      setIsValidating(false);
    }
  }, []);

  return {
    validateAddress,
    isValidating,
  };
}
