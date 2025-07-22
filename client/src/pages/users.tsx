import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, UserCheck, UserX, Shield, Award, User } from "lucide-react";

export default function UsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: allUsers = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: unapprovedUsers = [] } = useQuery({
    queryKey: ["/api/users/unapproved"],
  });

  const approveMutation = useMutation({
    mutationFn: (userId: number) => apiRequest("POST", `/api/users/${userId}/approve`, { approvedBy: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/unapproved"] });
      toast({
        title: "Utilisateur approuvé",
        description: "L'utilisateur a été approuvé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredUsers = allUsers.filter((usr: any) => {
    const matchesSearch = usr.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usr.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || usr.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'Bureau':
        return <Award className="h-4 w-4 text-blue-600" />;
      case 'Membre':
        return <User className="h-4 w-4 text-green-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'destructive';
      case 'Bureau':
        return 'default';
      case 'Membre':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusVariant = (isApproved: boolean) => {
    return isApproved ? 'default' : 'outline';
  };

  const roleStats = {
    Admin: allUsers.filter((u: any) => u.role === 'Admin').length,
    Bureau: allUsers.filter((u: any) => u.role === 'Bureau').length,
    Membre: allUsers.filter((u: any) => u.role === 'Membre').length,
  };

  return (
    <AppShell title="Gestion des utilisateurs">
      <div className="space-y-6">
        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Total utilisateurs</h3>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{allUsers.length}</p>
              <p className="text-sm text-blue-600 mt-1">Tous rôles confondus</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Pompiers actifs</h3>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{roleStats.Membre}</p>
              <p className="text-sm text-green-600 mt-1">Rôle Membre</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">En attente</h3>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <UserX className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{unapprovedUsers.length}</p>
              <p className="text-sm text-orange-600 mt-1">Approbation requise</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Administrateurs</h3>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{roleStats.Admin + roleStats.Bureau}</p>
              <p className="text-sm text-red-600 mt-1">Admin + Bureau</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">Tous les utilisateurs</TabsTrigger>
            <TabsTrigger value="pending">En attente d'approbation</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Utilisateurs enregistrés</CardTitle>
                  <div className="flex items-center space-x-3">
                    <Input
                      placeholder="Rechercher un utilisateur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-80"
                    />
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrer par rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les rôles</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Bureau">Bureau</SelectItem>
                        <SelectItem value="Membre">Membre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Inscription</TableHead>
                        <TableHead>Approuvé par</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((usr: any) => (
                        <TableRow key={usr.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                {getRoleIcon(usr.role)}
                              </div>
                              <div>
                                <p className="font-medium">{usr.username}</p>
                                <p className="text-sm text-gray-500">#{usr.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{usr.email}</TableCell>
                          <TableCell>
                            <Badge variant={getRoleVariant(usr.role)}>
                              {usr.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(usr.isApproved)}>
                              {usr.isApproved ? 'Approuvé' : 'En attente'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(usr.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {usr.approvedBy ? (
                              <span className="text-sm text-gray-600">
                                {allUsers.find((u: any) => u.id === usr.approvedBy)?.username || 'Inconnu'}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Utilisateurs en attente d'approbation</CardTitle>
              </CardHeader>
              <CardContent>
                {unapprovedUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur en attente</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Tous les utilisateurs ont été approuvés.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Utilisateur</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Rôle demandé</TableHead>
                          <TableHead>Date d'inscription</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unapprovedUsers.map((usr: any) => (
                          <TableRow key={usr.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                  {getRoleIcon(usr.role)}
                                </div>
                                <div>
                                  <p className="font-medium">{usr.username}</p>
                                  <p className="text-sm text-gray-500">#{usr.id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{usr.email}</TableCell>
                            <TableCell>
                              <Badge variant={getRoleVariant(usr.role)}>
                                {usr.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(usr.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {(user?.role === 'Admin' || user?.role === 'Bureau') && (
                                <Button
                                  size="sm"
                                  onClick={() => approveMutation.mutate(usr.id)}
                                  disabled={approveMutation.isPending}
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Approuver
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
