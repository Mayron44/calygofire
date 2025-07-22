import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { offlineService } from "@/lib/offline";
import { Wifi, WifiOff, RefreshCw, AlertCircle } from "lucide-react";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnlineStatusChange = (event: any) => {
      setIsOnline(event.detail.isOnline);
      setPendingCount(offlineService.pendingCount);
    };

    window.addEventListener('onlineStatusChange', handleOnlineStatusChange);
    
    // Mise à jour initiale
    setPendingCount(offlineService.pendingCount);

    return () => {
      window.removeEventListener('onlineStatusChange', handleOnlineStatusChange);
    };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    
    // Simule une synchronisation
    setTimeout(() => {
      setSyncing(false);
      setPendingCount(0);
    }, 2000);
  };

  if (isOnline && pendingCount === 0) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Badge variant="default" className="bg-green-600 text-white">
          <Wifi className="h-3 w-3 mr-1" />
          En ligne
        </Badge>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {!isOnline ? (
        <Alert className="border-amber-200 bg-amber-50">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Mode hors ligne</span>
            <Badge variant="secondary" className="ml-2">
              {pendingCount} en attente
            </Badge>
          </AlertDescription>
        </Alert>
      ) : pendingCount > 0 ? (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{pendingCount} ventes à synchroniser</span>
            <Button
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="ml-2"
            >
              {syncing ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Sync...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Synchroniser
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}