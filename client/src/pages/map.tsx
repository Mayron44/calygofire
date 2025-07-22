import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { LeafletMap } from "@/components/map/leaflet-map";
import { QuickSaleModal } from "@/components/sales/quick-sale-modal";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Navigation } from "lucide-react";

export default function MapPage() {
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    sector: "all",
    pompier: "all",
    status: "all",
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ["/api/addresses"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const pompiers = users.filter((user: any) => user.role === "Membre");

  const filteredAddresses = addresses.filter((address: any) => {
    const matchesPompier = filters.pompier === "all" || address.assignedTo === parseInt(filters.pompier);
    const matchesStatus = filters.status === "all" || address.status === filters.status;
    return matchesPompier && matchesStatus;
  });

  const handleAddressClick = (address: any) => {
    setSelectedAddress(address);
    setIsModalOpen(true);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sold':
        return 'Vendu';
      case 'refused':
        return 'Refus';
      case 'revisit':
        return 'À repasser';
      case 'absent':
        return 'Absent';
      default:
        return 'Non visité';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'sold':
        return 'default';
      case 'refused':
        return 'destructive';
      case 'revisit':
        return 'secondary';
      case 'absent':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const statusCounts = {
    sold: addresses.filter((a: any) => a.status === 'sold').length,
    refused: addresses.filter((a: any) => a.status === 'refused').length,
    revisit: addresses.filter((a: any) => a.status === 'revisit').length,
    unvisited: addresses.filter((a: any) => a.status === 'unvisited').length,
  };

  return (
    <AppShell title="Cartographie">
      <div className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Vendu</span>
                <span className="text-2xl font-bold ml-auto">{statusCounts.sold}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">Refus</span>
                <span className="text-2xl font-bold ml-auto">{statusCounts.refused}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">À repasser</span>
                <span className="text-2xl font-bold ml-auto">{statusCounts.revisit}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-medium">Non visité</span>
                <span className="text-2xl font-bold ml-auto">{statusCounts.unvisited}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Carte interactive - Sainte-Pazanne</span>
              </CardTitle>
              <div className="flex items-center space-x-3">
                <Button variant="outline">
                  <Navigation className="h-4 w-4 mr-2" />
                  Optimiser la tournée
                </Button>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle adresse
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select value={filters.sector} onValueChange={(value) => setFilters({ ...filters, sector: value })}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tous les secteurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les secteurs</SelectItem>
                  <SelectItem value="centre-ville">Centre-ville</SelectItem>
                  <SelectItem value="closeaux">Les Closeaux</SelectItem>
                  <SelectItem value="bernardiere">La Bernardière</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.pompier} onValueChange={(value) => setFilters({ ...filters, pompier: value })}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tous les pompiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les pompiers</SelectItem>
                  {pompiers.map((pompier: any) => (
                    <SelectItem key={pompier.id} value={pompier.id.toString()}>
                      {pompier.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="sold">Vendu</SelectItem>
                  <SelectItem value="refused">Refus</SelectItem>
                  <SelectItem value="revisit">À repasser</SelectItem>
                  <SelectItem value="unvisited">Non visité</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <LeafletMap 
              addresses={filteredAddresses} 
              onAddressClick={handleAddressClick}
            />
          </CardContent>
        </Card>

        {/* Address List */}
        <Card>
          <CardHeader>
            <CardTitle>Adresses ({filteredAddresses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredAddresses.map((address: any) => (
                <div
                  key={address.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleAddressClick(address)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      address.status === 'sold' ? 'bg-green-500' :
                      address.status === 'refused' ? 'bg-red-500' :
                      address.status === 'revisit' ? 'bg-orange-500' :
                      'bg-gray-400'
                    }`}></div>
                    <div>
                      <p className="font-medium">{address.fullAddress}</p>
                      <p className="text-sm text-gray-600">{address.contactName}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(address.status)}>
                    {getStatusText(address.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedAddress && (
        <QuickSaleModal
          address={selectedAddress}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAddress(null);
          }}
        />
      )}
    </AppShell>
  );
}
