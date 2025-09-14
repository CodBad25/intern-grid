import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, FileText, Calendar, MessageSquare, Bell, Shield, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Si l'utilisateur est connecté, rediriger vers le dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Suivi des Stagiaires</h1>
              <p className="text-sm text-muted-foreground">Plateforme de gestion</p>
            </div>
          </div>
          
          <Button onClick={() => navigate('/auth')} className="gap-2">
            <LogIn className="w-4 h-4" />
            Se connecter
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            ✨ Nouvelle version 2.2 disponible
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            Gestion Moderne des Stagiaires
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Une plateforme complète pour le suivi, la communication et la gestion 
            des stages avec des outils modernes et intuitifs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')} 
              className="gap-2"
            >
              Commencer maintenant
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/features')}
            >
              Découvrir les fonctionnalités
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Fonctionnalités Principales</h2>
          <p className="text-muted-foreground">
            Tout ce dont vous avez besoin pour un suivi efficace
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover-lift">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Gestion des Séances</CardTitle>
              <CardDescription>
                Planifiez et suivez toutes vos sessions avec différents types et modes horaires
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-lift">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Documents Sécurisés</CardTitle>
              <CardDescription>
                Stockage et partage de fichiers avec Supabase, hébergement en Europe (RGPD)
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-lift">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Communication Interactive</CardTitle>
              <CardDescription>
                Questions, réponses et réactions pour une communication fluide et engageante
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-lift">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Notifications Avancées</CardTitle>
              <CardDescription>
                Système de notifications en temps réel avec filtrage et personnalisation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-lift">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Sécurité & Rôles</CardTitle>
              <CardDescription>
                Gestion des accès avec rôles et permissions granulaires pour tous les utilisateurs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-lift">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Multi-utilisateurs</CardTitle>
              <CardDescription>
                Support complet pour tuteurs, administrateurs et stagiaires avec leurs propres espaces
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto text-center p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="space-y-6">
            <h2 className="text-3xl font-bold">Prêt à commencer ?</h2>
            <p className="text-lg text-muted-foreground">
              Créez votre compte et découvrez une nouvelle façon de gérer vos stages
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="gap-2"
              >
                Créer un compte gratuit
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/features')}
              >
                En savoir plus
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Suivi des Stagiaires. Plateforme moderne de gestion des stages.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
