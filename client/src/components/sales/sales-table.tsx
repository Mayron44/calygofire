import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Trash2, Download, Plus } from "lucide-react";
import { AddressModal } from "./address-modal";

export function SalesTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: addresses = [] } = useQuery({
    queryKey: ["/api/addresses"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const filteredAddresses = addresses.filter((address: any) => {
    const matchesSearch = address.fullAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         address.contactName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || address.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const getUserName = (userId: number) => {
    const user = users.find((u: any) => u.id === userId);
    return user?.username || 'Non assigné';
  };

  const handleAddressClick = (address: any) => {
    setSelectedAddress(address);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Historique des ventes</h3>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle adresse
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <Input
            placeholder="Rechercher une adresse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="sold">Vendu</SelectItem>
              <SelectItem value="refused">Refus</SelectItem>
              <SelectItem value="revisit">À repasser</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="unvisited">Non visité</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Adresse</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Pompier</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAddresses.map((address: any) => (
              <TableRow key={address.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="text-sm font-medium text-gray-900">{address.fullAddress}</div>
                  <div className="text-sm text-gray-500">{address.housingType}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900">{address.contactName || 'Non défini'}</div>
                  <div className="text-sm text-gray-500">{address.contactPhone || ''}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900">{getUserName(address.assignedTo)}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(address.status)}>
                    {getStatusText(address.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-900">
                  {new Date(address.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-sm text-gray-900">
                  {address.status === 'sold' ? '10 €' : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddressClick(address)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="px-6 py-4 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Affichage de 1 à {filteredAddresses.length} sur {addresses.length} résultats
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">Précédent</Button>
            <Button variant="outline" size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Suivant</Button>
          </div>
        </div>
      </div>

      <AddressModal
        address={selectedAddress}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAddress(null);
        }}
      />
    </div>
  );
}
