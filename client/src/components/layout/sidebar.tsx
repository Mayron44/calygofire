import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Flame, 
  LayoutDashboard, 
  Map, 
  TrendingUp, 
  Route, 
  Users, 
  CreditCard,
  LogOut
} from "lucide-react";

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navigation = [
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Cartographie", href: "/map", icon: Map },
    { name: "Ventes", href: "/sales", icon: TrendingUp },
    { name: "Tournées", href: "/tournees", icon: Route },
    { name: "Utilisateurs", href: "/users", icon: Users },
  ];

  const isActive = (href: string) => location === href;

  return (
    <div className="flex flex-col h-full gradient-overlay text-white">
      {/* Logo and Title */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Calygo Fire</h1>
            <p className="text-sm opacity-80">Gestion des ventes</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <Link key={item.name} href={item.href}>
            <Button
              variant="ghost"
              className={`w-full justify-start text-white hover:bg-white/20 ${
                isActive(item.href) ? "bg-white/20" : ""
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Button>
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">{user?.username}</p>
            <p className="text-xs opacity-80">{user?.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/20"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}
