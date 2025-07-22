import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { useRouteOptimization } from "@/hooks/use-map";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Route, MapPin, Users, Clock, Calendar, Edit, Trash2, Navigation } from "lucide-react";

export default function TourneesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { optimizeRoute, isOptimizing } = useRouteOptimization();
  
  const [selectedAddresses, setSelectedAddresses] = useState<number[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    pompierId: user?.id || 0,
    scheduledDate: "",
    selectedAddresses: [] as number[]
  });

  const { data: tournees = [] } = useQuery({
    queryKey: ["/api/tournees"],
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ["/api/addresses"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const createTourneeMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/tournees", data);
    },
    onSuccess: () => {
      toast({
        title: "Tournée créée !",
        description: "La tournée a été créée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tournees"] });
      setCreateModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteTourneeMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/tournees/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Tournée supprimée",
        description: "La tournée a été supprimée",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tournees"] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      pompierId: user?.id || 0,
      scheduledDate: "",
      selectedAddresses: []
    });
    setSelectedAddresses([]);
  };

  const handleCreateTournee = async () => {
    if (!formData.name || !formData.scheduledDate || selectedAddresses.length === 0) {
      toast({
        title: "Données manquantes",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive",
      });
      return;
    }

    // Optimize route
    const addressesWithCoords = selectedAddresses.map(id => {
      const address = addresses.find((a: any) => a.id === id);
      return {
        id,
        lat: parseFloat(address?.latitude || "0"),
        lon: parseFloat(address?.longitude || "0")
      };
    }).filter(addr => addr.lat !== 0 && addr.lon !== 0);

    const optimizedOrder = await optimizeRoute(addressesWithCoords);

    const tourneeData = {
      name: formData.name,
      pompierId: formData.pompierId,
      scheduledDate: new Date(formData.scheduledDate).toISOString(),
      addressIds: optimizedOrder.map(String),
      optimizedRoute: JSON.stringify(optimizedOrder),
      createdBy: user?.id,
      status: "planned"
    };

    createTourneeMutation.mutate(tourneeData);
  };

  const handleAddressToggle = (addressId: number) => {
    setSelectedAddresses(prev => 
      prev.includes(addressId) 
        ? prev.filter(id => id !== addressId)
        : [...prev, addressId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "planned": return "Planifiée";
      case "in_progress": return "En cours";
      case "completed": return "Terminée";
      case "cancelled": return "Annulée";
      default: return status;
    }
  };

  const unvisitedAddresses = addresses.filter((addr: any) => 
    addr.status === 'unvisited' || addr.status === 'revisit'
  );

  return (
    <AppShell title="Gestion des tournées">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tournées</h1>
            <p className="text-gray-600">Planifiez et optimisez vos tournées de vente</p>
          </div>
          
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle tournée
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle tournée</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la tournée</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Tournée Centre-ville"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Date planifiée</Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pompier">Pompier assigné</Label>
                  <Select 
                    value={formData.pompierId.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, pompierId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un pompier" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user: any) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Adresses à visiter ({selectedAddresses.length} sélectionnées)</Label>
                  <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-1">
                    {unvisitedAddresses.map((address: any) => (
                      <div key={address.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`address-${address.id}`}
                          checked={selectedAddresses.includes(address.id)}
                          onCheckedChange={() => handleAddressToggle(address.id)}
                        />
                        <Label htmlFor={`address-${address.id}`} className="text-sm">
                          {address.fullAddress}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setCreateModalOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleCreateTournee}
                    disabled={createTourneeMutation.isPending || isOptimizing}
                  >
                    {isOptimizing ? "Optimisation..." : "Créer la tournée"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tournées List */}
        <div className="grid gap-4">
          {tournees.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tournée</h3>
                <p className="text-gray-500">
                  Créez votre première tournée pour commencer à organiser vos visites
                </p>
              </CardContent>
            </Card>
          ) : (
            tournees.map((tournee: any) => (
              <Card key={tournee.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Route className="h-5 w-5" />
                        {tournee.name}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {users.find((u: any) => u.id === tournee.pompierId)?.username || 'Utilisateur inconnu'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(tournee.scheduledDate).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {tournee.addressIds?.length || 0} adresses
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(tournee.status)}>
                        {getStatusText(tournee.status)}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteTourneeMutation.mutate(tournee.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Adresses de la tournée :</h4>
                    <div className="space-y-1">
                      {tournee.addressIds?.map((addressId: string, index: number) => {
                        const address = addresses.find((a: any) => a.id === parseInt(addressId));
                        return (
                          <div key={addressId} className="flex items-center gap-2 text-sm">
                            <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs">
                              {index + 1}
                            </span>
                            <span>{address?.fullAddress || 'Adresse inconnue'}</span>
                          </div>
                        );
                      }) || <p className="text-sm text-gray-500">Aucune adresse assignée</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}