import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { offlineService } from "@/lib/offline";
import { CheckCircle, CreditCard, Banknote, Smartphone } from "lucide-react";

interface QuickSaleModalProps {
  address: any;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickSaleModal({ address, isOpen, onClose }: QuickSaleModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    quantity: 1,
    unitPrice: "",
    paymentMethod: "cash",
    customerName: "",
    customerPhone: "",
    notes: ""
  });

  const totalAmount = formData.quantity * (parseFloat(formData.unitPrice) || 0);

  const saleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      try {
        // Create the sale
        const saleResponse = await apiRequest("POST", "/api/sales", saleData);
        
        // Create a visit record
        await apiRequest("POST", "/api/visits", {
          addressId: address.id,
          pompierId: user?.id,
          status: "sold",
          amount: totalAmount,
          paymentMethod: formData.paymentMethod,
          comments: `Vente: ${formData.quantity} calendriers - ${formData.paymentMethod}${formData.notes ? ` | ${formData.notes}` : ''}`,
          visitDate: new Date().toISOString()
        });

        return saleResponse;
      } catch (error) {
        // Si hors ligne, ajouter à la queue
        if (!navigator.onLine) {
          await offlineService.addPendingRequest(
            "/api/sales",
            "POST",
            { "Content-Type": "application/json" },
            JSON.stringify({
              addressId: address.id,
              pompierId: user?.id,
              amount: totalAmount,
              paymentMethod: formData.paymentMethod,
              saleDate: new Date().toISOString()
            })
          );
          
          await offlineService.addPendingRequest(
            "/api/visits",
            "POST",
            { "Content-Type": "application/json" },
            JSON.stringify({
              addressId: address.id,
              pompierId: user?.id,
              status: "sold",
              comments: `Vente: ${formData.quantity} calendriers - ${formData.paymentMethod}${formData.notes ? ` | ${formData.notes}` : ''}`,
              visitDate: new Date().toISOString()
            })
          );
          
          return { offline: true };
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data?.offline) {
        toast({
          title: "Vente enregistrée (hors ligne)",
          description: `${formData.quantity} calendrier(s) - synchronisation automatique en ligne`,
          duration: 3000,
        });
      } else {
        toast({
          title: "Vente enregistrée !",
          description: `${formData.quantity} calendrier(s) vendu(s) pour ${totalAmount}€`,
          duration: 3000,
        });
      }
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales/stats"] });
      
      onClose();
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

  const visitMutation = useMutation({
    mutationFn: async (visitData: any) => {
      return await apiRequest("POST", "/api/visits", visitData);
    },
    onSuccess: () => {
      toast({
        title: "Visite enregistrée !",
        description: "Statut de l'adresse mis à jour",
        duration: 3000,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      onClose();
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

  const resetForm = () => {
    setFormData({
      quantity: 1,
      unitPrice: "",
      paymentMethod: "cash",
      customerName: "",
      customerPhone: "",
      notes: ""
    });
  };

  const handleSale = () => {
    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      toast({
        title: "Prix manquant",
        description: "Veuillez saisir un prix valide",
        variant: "destructive"
      });
      return;
    }

    const saleData = {
      addressId: address.id,
      pompierId: user?.id,
      amount: totalAmount,
      paymentMethod: formData.paymentMethod,
      saleDate: new Date().toISOString()
    };

    saleMutation.mutate(saleData);
  };

  const handleVisitOnly = (status: string) => {
    const visitData = {
      addressId: address.id,
      pompierId: user?.id,
      status,
      comments: formData.notes || `Visite: ${status}`,
      visitDate: new Date().toISOString()
    };

    visitMutation.mutate(visitData);
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Banknote className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md z-[9999]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Vente rapide
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-medium text-sm">{address?.fullAddress}</p>
            {address?.contactName && (
              <p className="text-sm text-gray-600">{address.contactName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="10"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitPrice">Prix unitaire (€)</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0.01"
                step="0.01"
                max="100"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                placeholder="ex: 15.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Mode de paiement</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Espèces
                  </div>
                </SelectItem>
                <SelectItem value="card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Carte bancaire
                  </div>
                </SelectItem>
                <SelectItem value="mobile">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Paiement mobile
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nom client</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Nom du client"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Téléphone</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="06 12 34 56 78"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes sur la vente..."
              rows={2}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total:</span>
              <Badge variant="default" className="text-lg">
                {totalAmount}€
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleSale}
              disabled={saleMutation.isPending}
              className="w-full gradient-overlay"
            >
              {saleMutation.isPending ? "Enregistrement..." : 
               !navigator.onLine ? `Vendre ${formData.quantity} calendrier(s) - ${totalAmount}€ (hors ligne)` :
               `Vendre ${formData.quantity} calendrier(s) - ${totalAmount}€`}
            </Button>

            <div className="flex gap-2">
              <Button 
                onClick={() => handleVisitOnly("refused")}
                disabled={visitMutation.isPending}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                Refus
              </Button>
              <Button 
                onClick={() => handleVisitOnly("revisit")}
                disabled={visitMutation.isPending}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                À repasser
              </Button>
              <Button 
                onClick={() => handleVisitOnly("absent")}
                disabled={visitMutation.isPending}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                Absent
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}