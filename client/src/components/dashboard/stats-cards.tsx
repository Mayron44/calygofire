import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Euro, Calendar, Home, Flame } from "lucide-react";

export function StatsCards() {
  const { data: salesStats } = useQuery({
    queryKey: ["/api/sales/stats"],
  });

  const { data: addresses } = useQuery({
    queryKey: ["/api/addresses"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  const totalAmount = salesStats?.totalAmount || 0;
  const calendarsSold = salesStats?.calendarsSold || 0;
  const addressesVisited = addresses?.filter((addr: any) => addr.status !== "unvisited").length || 0;
  const totalAddresses = addresses?.length || 0;
  const activePompiers = users?.filter((user: any) => user.role === "Membre").length || 0;

  const coverage = totalAddresses > 0 ? Math.round((addressesVisited / totalAddresses) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total des ventes</h3>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Euro className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalAmount.toLocaleString()} €</p>
          <p className="text-sm text-green-600 mt-1">+12% ce mois</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Calendriers vendus</h3>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{calendarsSold.toLocaleString()}</p>
          <p className="text-sm text-blue-600 mt-1">Sur {totalAddresses} total</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Adresses visitées</h3>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Home className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{addressesVisited.toLocaleString()}</p>
          <p className="text-sm text-orange-600 mt-1">{coverage}% de couverture</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Pompiers actifs</h3>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Flame className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{activePompiers}</p>
          <p className="text-sm text-red-600 mt-1">En activité</p>
        </CardContent>
      </Card>
    </div>
  );
}
