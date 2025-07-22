import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Download, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export function AddressLoader() {
  const [loadingStatus, setLoadingStatus] = useState<{
    isLoading: boolean;
    progress: number;
    message: string;
    results?: { loaded: number; skipped: number; errors: number };
  }>({
    isLoading: false,
    progress: 0,
    message: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loadAddressesMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/addresses/load-from-osm"),
    onMutate: () => {
      setLoadingStatus({
        isLoading: true,
        progress: 0,
        message: "Connexion à OpenStreetMap..."
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      
      setLoadingStatus({
        isLoading: false,
        progress: 100,
        message: data.message,
        results: data.results
      });

      toast({
        title: "Chargement terminé !",
        description: `${data.results.loaded} nouvelles adresses ajoutées`,
      });

      // Refresh addresses list
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
    },
    onError: (error) => {
      setLoadingStatus({
        isLoading: false,
        progress: 0,
        message: `Erreur: ${error.message}`
      });

      toast({
        title: "Erreur de chargement",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const geocodeMissingMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/addresses/geocode-missing"),
    onMutate: () => {
      setLoadingStatus({
        isLoading: true,
        progress: 0,
        message: "Géocodage des adresses manquantes..."
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      
      setLoadingStatus({
        isLoading: false,
        progress: 100,
        message: data.message,
        results: data.results
      });

      toast({
        title: "Géocodage terminé !",
        description: `${data.results.updated} adresses mises à jour`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
    },
    onError: (error) => {
      setLoadingStatus({
        isLoading: false,
        progress: 0,
        message: `Erreur: ${error.message}`
      });

      toast({
        title: "Erreur de géocodage",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleLoadAddresses = () => {
    loadAddressesMutation.mutate();
  };

  const handleGeocodeMissing = () => {
    geocodeMissingMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Chargement automatique des adresses
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p>Chargez automatiquement les adresses de Sainte-Pazanne depuis OpenStreetMap pour éviter la saisie manuelle.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={handleLoadAddresses}
            disabled={loadingStatus.isLoading}
            className="flex items-center gap-2"
          >
            {loadingStatus.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Charger les adresses OSM
          </Button>

          <Button 
            onClick={handleGeocodeMissing}
            disabled={loadingStatus.isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {loadingStatus.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            Géocoder les adresses manquantes
          </Button>
        </div>

        {loadingStatus.isLoading && (
          <div className="space-y-2">
            <Progress value={loadingStatus.progress} className="w-full" />
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingStatus.message}
            </p>
          </div>
        )}

        {loadingStatus.message && !loadingStatus.isLoading && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {loadingStatus.message}
            </AlertDescription>
          </Alert>
        )}

        {loadingStatus.results && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              {loadingStatus.results.loaded} ajoutées
            </Badge>
            
            {loadingStatus.results.skipped > 0 && (
              <Badge variant="secondary">
                {loadingStatus.results.skipped} ignorées
              </Badge>
            )}
            
            {loadingStatus.results.errors > 0 && (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                {loadingStatus.results.errors} erreurs
              </Badge>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 border-t pt-3">
          <p><strong>Information:</strong> Le chargement peut prendre quelques minutes selon le nombre d'adresses à traiter.</p>
          <p><strong>Source:</strong> OpenStreetMap (OSM) - Données libres et ouvertes</p>
        </div>
      </CardContent>
    </Card>
  );
}