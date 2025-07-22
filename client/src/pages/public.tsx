import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Calendar, MapPin, Users } from "lucide-react";

export default function PublicPage() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-overlay rounded-lg flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Calygo Fire</h1>
                <p className="text-sm text-gray-600">Gestion des ventes de calendriers</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline">Connexion</Button>
              </Link>
              <Link href="/register">
                <Button className="gradient-overlay">S'inscrire</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Simplifiez la gestion de vos 
              <span className="gradient-overlay bg-clip-text text-transparent"> ventes de calendriers</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Calygo Fire est une solution complète pour les sapeurs-pompiers, permettant de gérer efficacement 
              les ventes de calendriers avec cartographie interactive, suivi des tournées et gestion des paiements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="gradient-overlay">
                  Commencer maintenant
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Fonctionnalités principales</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer vos ventes de calendriers efficacement
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 gradient-overlay rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Cartographie interactive</CardTitle>
                <CardDescription>
                  Visualisez toutes vos adresses sur une carte avec statuts colorés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Intégration OpenStreetMap avec géolocalisation automatique des adresses
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 gradient-overlay rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Suivi des ventes</CardTitle>
                <CardDescription>
                  Tableau de bord complet avec statistiques et filtres
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Suivez vos ventes par pompier, secteur, date avec historique complet
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 gradient-overlay rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Gestion des équipes</CardTitle>
                <CardDescription>
                  Attribution des zones et suivi des performances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Rôles Admin, Bureau, Membre avec validation des comptes
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 gradient-overlay rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Optimisation des tournées</CardTitle>
                <CardDescription>
                  Planification intelligente des parcours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Création de tournées optimisées avec navigation GPS intégrée
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Contactez-nous</h3>
            <p className="text-lg text-gray-600 mb-8">
              Vous avez des questions ? Notre équipe est là pour vous aider.
            </p>
            <div className="space-y-4">
              <p className="text-gray-700">
                <strong>Email:</strong> contact@calygo-fire.fr
              </p>
              <p className="text-gray-700">
                <strong>Téléphone:</strong> 02 40 XX XX XX
              </p>
              <p className="text-gray-700">
                <strong>Adresse:</strong> Sainte-Pazanne, Loire-Atlantique
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 gradient-overlay rounded-lg flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">Calygo Fire</span>
            </div>
            <p className="text-gray-400">
              © 2024 Calygo Fire. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
