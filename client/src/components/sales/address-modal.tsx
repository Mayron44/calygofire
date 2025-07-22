import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Check, Clock } from "lucide-react";

interface AddressModalProps {
  address?: any;
  isOpen: boolean;
  onClose: () => void;
}

export function AddressModal({ address, isOpen, onClose }: AddressModalProps) {
  const [formData, setFormData] = useState({
    fullAddress: "",
    housingType: "",
    contactName: "",
    contactPhone: "",
    status: "unvisited",
    assignedTo: "",
    comments: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: visits = [] } = useQuery({
    queryKey: ["/api/visits/address", address?.id],
    enabled: !!address?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/addresses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({
        title: "Succès",
        description: "Adresse créée avec succès",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", `/api/addresses/${address.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({
        title: "Succès",
        description: "Adresse mise à jour avec succès",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (address) {
      setFormData({
        fullAddress: address.fullAddress || "",
        housingType: address.housingType || "",
        contactName: address.contactName || "",
        contactPhone: address.contactPhone || "",
        status: address.status || "unvisited",
        assignedTo: address.assignedTo?.toString() || "",
        comments: address.comments || "",
      });
    } else {
      setFormData({
        fullAddress: "",
        housingType: "",
        contactName: "",
        contactPhone: "",
        status: "unvisited",
        assignedTo: "",
        comments: "",
      });
    }
  }, [address]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      assignedTo: formData.assignedTo ? parseInt(formData.assignedTo) : null,
    };

    if (address) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find((u: any) => u.id === userId);
    return user?.username || 'Utilisateur inconnu';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {address ? "Détails de l'adresse" : "Nouvelle adresse"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullAddress">Adresse</Label>
              <Input
                id="fullAddress"
                value={formData.fullAddress}
                onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                placeholder="15 Rue de la Paix, Sainte-Pazanne"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="housingType">Type de logement</Label>
              <Select value={formData.housingType} onValueChange={(value) => setFormData({ ...formData, housingType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Maison individuelle">Maison individuelle</SelectItem>
                  <SelectItem value="Appartement">Appartement</SelectItem>
                  <SelectItem value="Maison mitoyenne">Maison mitoyenne</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactName">Nom du contact</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="Nom du contact"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Téléphone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="06 12 34 56 78"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unvisited">Non visité</SelectItem>
                  <SelectItem value="sold">Vendu</SelectItem>
                  <SelectItem value="refused">Refus</SelectItem>
                  <SelectItem value="revisit">À repasser</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Pompier assigné</Label>
              <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un pompier" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter((user: any) => user.role === "Membre").map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="comments">Commentaires</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Informations supplémentaires..."
                rows={3}
              />
            </div>
          </div>
          
          {address && visits.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Historique des passages</h4>
              <div className="space-y-3">
                {visits.map((visit: any) => (
                  <div key={visit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        visit.status === 'sold' ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        {visit.status === 'sold' ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(visit.visitDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <Badge variant={getStatusVariant(visit.status)}>
                            {getStatusText(visit.status)}
                          </Badge>
                          {visit.amount && ` - ${visit.amount}€`}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{getUserName(visit.pompierId)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {address ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
