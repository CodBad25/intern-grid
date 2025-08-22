
import React, { useState } from 'react';
import { User, Settings, Palette, Eye, EyeOff, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { useUserPresence } from '@/hooks/useUserPresence';
import { supabase } from '@/integrations/supabase/client';
import { TUTOR_COLORS } from '@/types';
import toast from 'react-hot-toast';
import { LoadingSpinner } from './LoadingSpinner';
import { AvatarUpload } from './AvatarUpload';
import { PerformanceOptimizer } from './performance/PerformanceOptimizer';

export function UserSettings() {
  const { user } = useAuth();
  const { mySettings, updateMyPresenceSettings } = useUserPresence();
  const [isLoading, setIsLoading] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [selectedColor, setSelectedColor] = useState('');
  const [showPresence, setShowPresence] = useState(mySettings?.show_presence ?? true);
  const [customStatus, setCustomStatus] = useState(mySettings?.custom_status || '');
  const [avatarUrl, setAvatarUrl] = useState('');

  React.useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('display_name, color, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erreur lors du chargement du profil:', error);
        return;
      }

      if (profile) {
        setDisplayName(profile.display_name || user.name);
        setSelectedColor(profile.color || 'hsl(220, 90%, 56%)');
        setAvatarUrl(profile.avatar_url || '');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Mise à jour du profil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          color: selectedColor
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Mise à jour des paramètres de présence
      await updateMyPresenceSettings({
        show_presence: showPresence,
        custom_status: customStatus || undefined
      });

      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'tuteur': return 'default';
      case 'stagiaire': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'tuteur': return 'Tuteur';
      case 'stagiaire': return 'Stagiaire';
      default: return 'Utilisateur';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Paramètres utilisateur</h1>
          <p className="text-muted-foreground">Gérez votre profil et vos préférences</p>
        </div>
      </div>

      {/* Informations de profil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profil utilisateur
          </CardTitle>
          <CardDescription>
            Modifiez vos informations personnelles et votre apparence
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AvatarUpload
            currentAvatarUrl={avatarUrl}
            displayName={displayName}
            color={selectedColor}
            onAvatarUpdate={handleAvatarUpdate}
          />

          <div className="flex items-center gap-6">
            <div className="flex-1 space-y-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled className="bg-muted" />
              </div>
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {getRoleLabel(user.role)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="displayName">Nom d'affichage</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Votre nom complet"
              />
            </div>

            {(user.role === 'tuteur' || user.role === 'admin') && (
              <div>
                <Label>Couleur personnalisée</Label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: selectedColor }}
                        />
                        {TUTOR_COLORS.find(c => c.value === selectedColor)?.label || 'Couleur personnalisée'}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {TUTOR_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Cette couleur vous identifiera dans l'application
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Paramètres de présence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Présence et statut
          </CardTitle>
          <CardDescription>
            Contrôlez votre visibilité et votre statut pour les autres utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showPresence">Afficher ma présence</Label>
              <p className="text-sm text-muted-foreground">
                Les autres utilisateurs peuvent voir que vous êtes en ligne
              </p>
            </div>
            <Switch
              id="showPresence"
              checked={showPresence}
              onCheckedChange={setShowPresence}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="customStatus">Statut personnalisé</Label>
            <Input
              id="customStatus"
              placeholder="Ex: En réunion, Disponible..."
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              maxLength={50}
            />
            <p className="text-sm text-muted-foreground">
              Laissez vide pour le statut par défaut
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            {showPresence ? (
              <Eye className="w-4 h-4 text-green-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-sm">
              Statut actuel : {showPresence ? 'Visible' : 'Masqué'}
              {customStatus && ` - ${customStatus}`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Sécurité */}
      <Card>
        <CardHeader>
          <CardTitle>Sécurité</CardTitle>
          <CardDescription>
            Gérez votre mot de passe et la sécurité de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">
            Changer le mot de passe
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Vous recevrez un email pour réinitialiser votre mot de passe
          </p>
        </CardContent>
      </Card>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <Button onClick={handleSaveProfile} disabled={isLoading}>
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder les modifications
            </>
          )}
        </Button>
      </div>

      {/* Outils de performance (Admin seulement) */}
      {user.role === 'admin' && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Outils de Performance (Admin)</h2>
          <PerformanceOptimizer />
        </div>
      )}
    </div>
  );
}
