import { AppShell } from "@/components/layout/app-shell";
import { SalesTable } from "@/components/sales/sales-table";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Calendar, Target } from "lucide-react";

export default function SalesPage() {
  const { data: salesStats } = useQuery({
    queryKey: ["/api/sales/stats"],
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ["/api/addresses"],
  });

  const totalSales = salesStats?.totalSales || 0;
  const totalAmount = salesStats?.totalAmount || 0;
  const soldCount = addresses.filter((addr: any) => addr.status === 'sold').length;
  const totalAddresses = addresses.length;
  const conversionRate = totalAddresses > 0 ? Math.round((soldCount / totalAddresses) * 100) : 0;

  return (
    <AppShell title="Gestion des ventes">
      <div className="space-y-6">
        {/* Sales Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Chiffre d'affaires</h3>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalAmount.toLocaleString()} €</p>
              <p className="text-sm text-green-600 mt-1">+8.2% vs mois dernier</p>
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
              <p className="text-3xl font-bold text-gray-900">{soldCount}</p>
              <p className="text-sm text-blue-600 mt-1">Sur {totalAddresses} adresses</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Taux de conversion</h3>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{conversionRate}%</p>
              <p className="text-sm text-purple-600 mt-1">Objectif: 75%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Panier moyen</h3>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {soldCount > 0 ? (totalAmount / soldCount).toFixed(2) : 0} €
              </p>
              <p className="text-sm text-orange-600 mt-1">Par vente</p>
            </CardContent>
          </Card>
        </div>

        {/* Sales Table */}
        <SalesTable />
      </div>
    </AppShell>
  );
}
