
import React, { useState } from 'react';
import { Users, Settings, Eye, EyeOff, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUserPresence } from '@/hooks/useUserPresence';

export function UserPresence() {
  const { onlineUsers, mySettings, updateMyPresenceSettings } = useUserPresence();
  const [showSettings, setShowSettings] = useState(false);
  const [customStatus, setCustomStatus] = useState(mySettings?.custom_status || '');
  const [showPresence, setShowPresence] = useState(mySettings?.show_presence ?? true);

  const handleSaveSettings = async () => {
    await updateMyPresenceSettings({
      show_presence: showPresence,
      custom_status: customStatus || undefined,
    });
    setShowSettings(false);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'tuteur':
        return 'default';
      case 'stagiaire':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'tuteur':
        return 'Tuteur';
      case 'stagiaire':
        return 'Stagiaire';
      default:
        return 'Utilisateur';
    }
  };

  return (
    <div className="space-y-4">
      {/* Indicateur de présence dans la barre de navigation */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Users className="w-4 h-4 mr-2" />
            En ligne ({onlineUsers.length})
            <Circle className="w-2 h-2 ml-2 fill-green-500 text-green-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Utilisateurs en ligne</h4>
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Paramètres de présence</DialogTitle>
                    <DialogDescription>
                      Configurez votre visibilité et votre statut pour les autres utilisateurs.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="show-presence">Afficher ma présence</Label>
                        <p className="text-sm text-muted-foreground">
                          Les autres utilisateurs peuvent voir que vous êtes en ligne
                        </p>
                      </div>
                      <Switch
                        id="show-presence"
                        checked={showPresence}
                        onCheckedChange={setShowPresence}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custom-status">Statut personnalisé</Label>
                      <Input
                        id="custom-status"
                        placeholder="Ex: En réunion, Disponible..."
                        value={customStatus}
                        onChange={(e) => setCustomStatus(e.target.value)}
                        maxLength={50}
                      />
                      <p className="text-sm text-muted-foreground">
                        Laissez vide pour le statut par défaut
                      </p>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowSettings(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleSaveSettings}>
                        Sauvegarder
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {onlineUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun utilisateur visible en ligne
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {onlineUsers.map((user) => (
                  <div key={user.user_id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50">
                    <Circle className="w-3 h-3 fill-green-500 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.display_name}</p>
                      {user.custom_status && (
                        <p className="text-xs text-muted-foreground truncate">{user.custom_status}</p>
                      )}
                    </div>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Votre statut :</span>
                <div className="flex items-center space-x-1">
                  {mySettings?.show_presence ? (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3" />
                      <span>Masqué</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
