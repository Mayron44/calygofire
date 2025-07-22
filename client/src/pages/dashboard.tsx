import { AppShell } from "@/components/layout/app-shell";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { LeafletMap } from "@/components/map/leaflet-map";
import { SalesTable } from "@/components/sales/sales-table";
import { AddressLoader } from "@/components/addresses/address-loader";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const [mapFilters, setMapFilters] = useState({
    sector: "all",
    pompier: "all",
    status: "all",
  });

  const { data: addresses = [] } = useQuery<any[]>({
    queryKey: ["/api/addresses"],
  });

  type User = {
    id: number;
    username: string;
    role: string;
    // add other fields as needed
  };

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const pompiers = users.filter((user: User) => user.role === "Membre");

  const filteredAddresses = addresses.filter((address: any) => {
    const matchesPompier = mapFilters.pompier === "all" || address.assignedTo === parseInt(mapFilters.pompier);
    const matchesStatus = mapFilters.status === "all" || address.status === mapFilters.status;
    return matchesPompier && matchesStatus;
  });

  return (
    <AppShell title="Tableau de bord">
      <div className="space-y-8">
        {/* Statistics Cards */}
        <StatsCards />

        {/* Address Loader Section */}
        <AddressLoader />

        {/* Interactive Map Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Cartographie - Sainte-Pazanne</CardTitle>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Vendu</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">Refus</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600">À repasser</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">Non visité</span>
                  </div>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle tournée
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select value={mapFilters.sector} onValueChange={(value) => setMapFilters({ ...mapFilters, sector: value })}>
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
              
              <Select value={mapFilters.pompier} onValueChange={(value) => setMapFilters({ ...mapFilters, pompier: value })}>
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
              
              <Select value={mapFilters.status} onValueChange={(value) => setMapFilters({ ...mapFilters, status: value })}>
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
            <LeafletMap addresses={filteredAddresses} />
          </CardContent>
        </Card>

        {/* Sales Tracking Table */}
        <SalesTable />
      </div>
    </AppShell>
  );
}
