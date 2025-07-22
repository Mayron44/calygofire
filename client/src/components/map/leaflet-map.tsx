import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Address {
  id: number;
  fullAddress: string;
  latitude: string;
  longitude: string;
  status: string;
  contactName?: string;
}

interface LeafletMapProps {
  addresses: Address[];
  onAddressClick?: (address: Address) => void;
}

export function LeafletMap({ addresses, onAddressClick }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    mapInstance.current = L.map(mapRef.current).setView([47.1036, -1.8486], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !addresses) return;

    // Clear existing markers
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstance.current?.removeLayer(layer);
      }
    });

    // Add markers for each address
    addresses.forEach((address) => {
      if (!address.latitude || !address.longitude) return;

      const lat = parseFloat(address.latitude);
      const lng = parseFloat(address.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      let color = '';
      let statusText = '';
      switch (address.status) {
        case 'sold':
          color = '#4caf50';
          statusText = 'Vendu';
          break;
        case 'refused':
          color = '#f44336';
          statusText = 'Refusé';
          break;
        case 'revisit':
          color = '#ff9800';
          statusText = 'À repasser';
          break;
        case 'absent':
          color = '#9c27b0';
          statusText = 'Absent';
          break;
        case 'unvisited':
        default:
          color = '#9e9e9e';
          statusText = 'Non visité';
          break;
      }

      const markerIcon = L.divIcon({
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
        className: 'custom-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([lat, lng], { icon: markerIcon })
        .addTo(mapInstance.current!)
        .bindPopup(`
          <div class="p-3 min-w-[200px]">
            <h4 class="font-semibold text-sm mb-1">${address.fullAddress}</h4>
            ${address.contactName ? `<p class="text-xs text-gray-600 mb-2">${address.contactName}</p>` : ''}
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-block w-3 h-3 rounded-full" style="background-color: ${color}"></span>
              <span class="text-xs font-medium">${statusText}</span>
            </div>
            <button 
              class="w-full px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              onclick="window.dispatchEvent(new CustomEvent('addressClick', { detail: ${address.id} }))"
            >
              ${address.status === 'sold' ? 'Voir détails' : 'Enregistrer vente'}
            </button>
          </div>
        `);

      if (onAddressClick) {
        marker.on('click', () => onAddressClick(address));
      }
    });

    // Listen for custom events from popup buttons
    const handleAddressClick = (event: any) => {
      const addressId = event.detail;
      const address = addresses.find(a => a.id === addressId);
      if (address && onAddressClick) {
        onAddressClick(address);
      }
    };

    window.addEventListener('addressClick', handleAddressClick);

    return () => {
      window.removeEventListener('addressClick', handleAddressClick);
    };
  }, [addresses, onAddressClick]);

  return <div ref={mapRef} className="leaflet-container rounded-lg" />;
}
