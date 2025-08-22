
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bell, Filter, RefreshCw, Users, FileText, Calendar, MessageSquare, Clock, Shield, Settings, TrendingUp, UserCheck, Image, Palette } from 'lucide-react';

export function Features() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Fonctionnalités & Versions</h1>
        <p className="text-muted-foreground">Découvrez toutes les fonctionnalités de l'application de suivi des stagiaires</p>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Version Actuelle</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="roadmap">Feuille de Route</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Gestion des séances */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Gestion des Séances
                </CardTitle>
                <CardDescription>Planification et suivi des sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• ✅ Création de séances avec types (visite, formation, évaluation)</li>
                  <li>• ✅ Modes horaires : ordinaire ou créneaux (M1-M4, S1-S4)</li>
                  <li>• ✅ Notes et descriptions détaillées</li>
                  <li>• ✅ Suivi par tuteur</li>
                </ul>
              </CardContent>
            </Card>

            {/* Gestion des documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Documents & Ressources
                  <Badge variant="secondary">✨ Nouveau</Badge>
                </CardTitle>
                <CardDescription>Stockage sécurisé avec Supabase</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• ✅ Upload direct depuis le PC (PDF, Word, images)</li>
                  <li>• ✅ Stockage sécurisé en Europe (Supabase)</li>
                  <li>• ✅ Partage de liens externes</li>
                  <li>• ✅ Catégorisation par type</li>
                  <li>• ✅ Descriptions détaillées</li>
                  <li>• ✅ Gestion des permissions</li>
                </ul>
              </CardContent>
            </Card>

            {/* Système de commentaires */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Remarques & Questions
                </CardTitle>
                <CardDescription>Communication interactive</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• ✅ Questions et remarques</li>
                  <li>• ✅ Réponses avec partage optionnel</li>
                  <li>• ✅ Édition après publication</li>
                  <li>• ✅ Système de réactions avec émojis (❤️, 👍, 👎, 😊, 😮, 😢)</li>
                  <li>• ✅ Suivi des interactions</li>
                </ul>
              </CardContent>
            </Card>

            {/* Présence utilisateur */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  Présence Utilisateur
                  <Badge variant="secondary">✨ Nouveau</Badge>
                </CardTitle>
                <CardDescription>Suivi en temps réel des utilisateurs</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• ✅ Indicateur d'utilisateurs en ligne</li>
                  <li>• ✅ Liste des utilisateurs connectés en temps réel</li>
                  <li>• ✅ Paramètres de visibilité personnalisables</li>
                  <li>• ✅ Statuts personnalisés (Disponible, En réunion, etc.)</li>
                  <li>• ✅ Interface intuitive avec popup</li>
                  <li>• ✅ Respect de la vie privée (masquage optionnel)</li>
                </ul>
              </CardContent>
            </Card>

            {/* Avatars et Profils */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5 text-primary" />
                  Avatars & Profils
                  <Badge variant="secondary">✨ Nouveau</Badge>
                </CardTitle>
                <CardDescription>Personnalisation des profils utilisateur</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• ✅ Upload d'avatars personnalisés</li>
                  <li>• ✅ Prévisualisation et recadrage</li>
                  <li>• ✅ Stockage sécurisé Supabase</li>
                  <li>• ✅ Gestion des permissions d'accès</li>
                  <li>• ✅ Suppression et remplacement</li>
                  <li>• ✅ Intégration dans tous les composants</li>
                </ul>
              </CardContent>
            </Card>

            {/* Paramètres Utilisateur */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Paramètres Utilisateur
                  <Badge variant="secondary">✨ Complété</Badge>
                </CardTitle>
                <CardDescription>Interface complète de gestion du profil</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• ✅ Gestion du nom d'affichage</li>
                  <li>• ✅ Couleurs personnalisées pour tuteurs</li>
                  <li>• ✅ Upload et gestion d'avatar</li>
                  <li>• ✅ Paramètres de présence</li>
                  <li>• ✅ Statuts utilisateur personnalisés</li>
                  <li>• ✅ Sécurité et changement de mot de passe</li>
                </ul>
              </CardContent>
            </Card>

            {/* Planning */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Planning Intégré
                </CardTitle>
                <CardDescription>Vue d'ensemble temporelle</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• ✅ Calendrier des événements</li>
                  <li>• ✅ Vue mensuelle et hebdomadaire</li>
                  <li>• ✅ Intégration séances et événements</li>
                  <li>• ✅ Export possible</li>
                </ul>
              </CardContent>
            </Card>

            {/* Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Tableau de Bord
                </CardTitle>
                <CardDescription>Vue d'ensemble et statistiques</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• ✅ Statistiques en temps réel</li>
                  <li>• ✅ Activité récente</li>
                  <li>• ✅ Indicateurs de progression</li>
                  <li>• ✅ Alertes et notifications</li>
                </ul>
              </CardContent>
            </Card>

            {/* Authentification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Backend & Sécurité
                </CardTitle>
                <CardDescription>Infrastructure moderne avec Supabase</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• ✅ Intégration Supabase complète</li>
                  <li>• ✅ Stockage sécurisé en Europe (RGPD)</li>
                  <li>• ✅ Rôles : Tuteur, Admin, Stagiaire</li>
                  <li>• ✅ Suivi de présence en temps réel</li>
                  <li>• ✅ Stockage de fichiers et avatars</li>
                  <li>• ✅ Base de données persistante</li>
                  <li>• ✅ Sessions et permissions RLS</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Système de Notifications
                <Badge variant="secondary">v2.0</Badge>
              </CardTitle>
              <CardDescription>
                Système avancé de notifications en temps réel avec filtrage intelligent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Mises à jour en temps réel
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Mises à jour instantanées via WebSockets (Supabase Realtime)</li>
                    <li>• Notifications instantanées lors de nouvelles publications</li>
                    <li>• Badge de compteur en temps réel</li>
                    <li>• Toast notifications pour alertes immédiates</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtrage avancé
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Filtrage par type (commentaires, réponses, documents, événements)</li>
                    <li>• Filtrage par statut (lu/non lu)</li>
                    <li>• Filtrage par période (aujourd'hui, semaine, mois)</li>
                    <li>• Interface intuitive avec sélecteurs</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Gestion des destinataires
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Notifications automatiques entre utilisateurs</li>
                    <li>• Respect des préférences de partage</li>
                    <li>• Exclusion automatique de l'expéditeur</li>
                    <li>• Personnalisation par type d'action</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Actions et gestion
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Navigation contextuelle vers le contenu lié</li>
                    <li>• Marquer comme lu individuellement ou en groupe</li>
                    <li>• Supprimer des notifications spécifiques</li>
                    <li>• Effacer toutes les notifications</li>
                    <li>• Actualisation manuelle disponible</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Types de notifications supportées :</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">💬 Nouveaux commentaires</Badge>
                    <Badge variant="outline">✅ Nouvelles réponses</Badge>
                    <Badge variant="outline">📄 Nouveaux documents</Badge>
                    <Badge variant="outline">📅 Nouveaux événements</Badge>
                    <Badge variant="outline">❤️ Réactions émojis</Badge>
                    <Badge variant="outline">👥 Présence utilisateur</Badge>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-300">🆕 Paramètres de Notifications (v2.1)</h4>
                  <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-400">
                    <li>• Notifications navigateur avec permissions</li>
                    <li>• Mode silencieux avec heures configurables</li>
                    <li>• Désactivation par type de notification</li>
                    <li>• Sons et vibrations personnalisables</li>
                    <li>• Prévisualisation et test des paramètres</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">✅ Complété (v2.4)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• ✅ **Notifications temps réel via WebSockets** (v2.4)</li>
                  <li>• ✅ Authentification Supabase complète (v2.4)</li>
                  <li>• ✅ Filtrage avancé des notifications (v2.3)</li>
                  <li>• ✅ Interface utilisateur améliorée (v2.3)</li>
                  <li>• ✅ Gestion granulaire des permissions de partage (v2.3)</li>
                  <li>• ✅ Navigation contextuelle depuis les notifications (v2.2)</li>
                  <li>• ✅ Paramètres de notifications complets (v2.2)</li>
                  <li>• ✅ Système de réactions avec émojis (v2.1)</li>
                  <li>• ✅ Intégration backend Supabase (v2.0)</li>
                  <li>• ✅ Stockage de fichiers sécurisé (v2.0)</li>
                  <li>• ✅ Suivi de présence utilisateur en temps réel (v2.1)</li>
                  <li>• ✅ Paramètres de visibilité personnalisables (v2.1)</li>
                  <li>• ✅ Statuts utilisateur personnalisés (v2.1)</li>
                  <li>• ✅ Système d'avatars complet (v2.2)</li>
                  <li>• ✅ Interface de paramètres utilisateur complète (v2.2)</li>
                  <li>• ✅ Gestion des couleurs personnalisées pour tuteurs (v2.0)</li>
                  <li>• ✅ Tableaux de bord analytiques avancés (v2.3)</li>
                  <li>• ✅ Optimisations de performance (v2.3)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">✅ Complété (v2.5)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• ✅ Migration base de données complète</li>
                  <li>• ✅ Refactoring des gros composants</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">📋 Planifié (v3.0)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 📋 Notifications push natives</li>
                  <li>• 📋 API REST complète</li>
                  <li>• 📋 Intégration avec systèmes externes</li>
                  <li>• 📋 Rapports et exports avancés</li>
                  <li>• 📋 Mode hors ligne avec synchronisation</li>
                  <li>• 📋 Chat en temps réel entre utilisateurs</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600">💡 Idées Futures (v4.0+)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 💡 Intelligence artificielle pour recommandations</li>
                  <li>• 💡 Intégration calendrier externe (Google, Outlook)</li>
                  <li>• 💡 Application mobile native</li>
                  <li>• 💡 Système de workflow automatisé</li>
                  <li>• 💡 Collaboration en temps réel (éditeur partagé)</li>
                  <li>• 💡 Gamification et badges de progression</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
