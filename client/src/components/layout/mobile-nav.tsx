import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Map, 
  TrendingUp, 
  Route, 
  Users
} from "lucide-react";

export function MobileNav() {
  const [location] = useLocation();

  const navigation = [
    { name: "Tableau", href: "/dashboard", icon: LayoutDashboard },
    { name: "Carte", href: "/map", icon: Map },
    { name: "Ventes", href: "/sales", icon: TrendingUp },
    { name: "Tournées", href: "/tournees", icon: Route },
    { name: "Profil", href: "/users", icon: Users },
  ];

  const isActive = (href: string) => location === href;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 lg:hidden">
      <div className="grid grid-cols-5 gap-1 p-2">
        {navigation.map((item) => (
          <Link key={item.name} href={item.href}>
            <Button
              variant="ghost"
              className={`flex flex-col items-center justify-center py-2 h-auto ${
                isActive(item.href) ? "text-blue-600" : "text-gray-600"
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.name}</span>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
