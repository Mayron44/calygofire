import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { AuthGuard } from "./components/auth/auth-guard";
import { OfflineIndicator } from "./components/offline/offline-indicator";
import PublicPage from "./pages/public";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import DashboardPage from "./pages/dashboard";
import MapPage from "./pages/map";
import SalesPage from "./pages/sales";
import UsersPage from "./pages/users";
import TourneesPage from "./pages/tournees";
import TourneesTestPage from "./pages/tournees-test";
import NotFound from "./pages/not-found";
import DebugRouter from "./debug-router";

function Router() {
  return (
    <Switch>
      <Route path="/" component={PublicPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard">
        <AuthGuard>
          <DashboardPage />
        </AuthGuard>
      </Route>
      <Route path="/map">
        <AuthGuard>
          <MapPage />
        </AuthGuard>
      </Route>
      <Route path="/sales">
        <AuthGuard>
          <SalesPage />
        </AuthGuard>
      </Route>
      <Route path="/users">
        <AuthGuard>
          <UsersPage />
        </AuthGuard>
      </Route>
      <Route path="/tournees" component={TourneesTestPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="gradient-bg min-h-screen">
            <Toaster />
            <DebugRouter />
            <OfflineIndicator />
            <Router />
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
