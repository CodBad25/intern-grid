import React, { useState } from 'react';
import { Settings, Bell, BellOff, Volume2, VolumeX, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useNotificationPreferences, NotificationPreferences } from '@/context/NotificationPreferencesContext';
import toast from 'react-hot-toast';

export function NotificationSettings() {
  const { preferences, savePreferences } = useNotificationPreferences();
  const [browserPermission, setBrowserPermission] = useState(
    () => typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const requestBrowserPermission = async () => {
    if (typeof Notification === 'undefined') {
      toast.error('Les notifications ne sont pas supportées par ce navigateur');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Permissions accordées');
        savePreferences({ browserNotifications: true });
      } else {
        toast.error('Permissions refusées');
        savePreferences({ browserNotifications: false });
      }
    } catch (error) {
      toast.error('Erreur lors de la demande de permissions');
    }
  };

  const testNotification = () => {
    if (browserPermission === 'granted') {
      new Notification('Test de notification', {
        body: 'Vos notifications fonctionnent correctement !',
        icon: '/favicon.ico',
      });
    } else {
      toast('Notification de test (dans l\'app)', {
        icon: '🔔',
      });
    }
  };

  const typeLabels = {
    new_comment: 'Nouveaux commentaires',
    new_response: 'Nouvelles réponses',
    new_document: 'Nouveaux documents',
    new_event: 'Nouveaux événements',
  };

  const frequencyLabels = {
    instant: 'Immédiate',
    hourly: 'Toutes les heures',
    daily: 'Quotidienne',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-primary/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Paramètres de notification</h2>
          <p className="text-sm text-muted-foreground">
            Configurez vos préférences de notification
          </p>
        </div>
      </div>

      {/* Activation générale */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {preferences.enabled ? (
                  <Bell className="w-5 h-5 text-primary" />
                ) : (
                  <BellOff className="w-5 h-5 text-muted-foreground" />
                )}
                Notifications
              </CardTitle>
              <CardDescription>
                Activer ou désactiver toutes les notifications
              </CardDescription>
            </div>
            <Switch
              checked={preferences.enabled}
              onCheckedChange={(checked) =>
                savePreferences({ enabled: checked })
              }
            />
          </div>
        </CardHeader>
      </Card>

      {preferences.enabled && (
        <>
          {/* Types de notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Types de notifications</CardTitle>
              <CardDescription>
                Choisissez les types de notifications que vous souhaitez recevoir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(typeLabels).map(([type, label]) => (
                <div key={type} className="flex items-center justify-between">
                  <Label htmlFor={type}>{label}</Label>
                  <Switch
                    id={type}
                    checked={preferences.types[type as keyof typeof preferences.types]}
                    onCheckedChange={(checked) =>
                      savePreferences({
                        types: { ...preferences.types, [type]: checked },
                      })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Méthodes de notification */}
          <Card>
            <CardHeader>
              <CardTitle>Méthodes de notification</CardTitle>
              <CardDescription>
                Comment souhaitez-vous recevoir vos notifications ?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Son */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {preferences.sound ? (
                    <Volume2 className="w-5 h-5 text-primary" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <Label>Son</Label>
                    <p className="text-sm text-muted-foreground">
                      Jouer un son lors des notifications
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.sound}
                  onCheckedChange={(checked) =>
                    savePreferences({ sound: checked })
                  }
                />
              </div>

              <Separator />

              {/* Notifications navigateur */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <div>
                    <Label>Notifications navigateur</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications même quand l'app est fermée
                    </p>
                    {browserPermission !== 'granted' && (
                      <Badge variant="outline" className="mt-1">
                        Permission requise
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {browserPermission !== 'granted' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={requestBrowserPermission}
                    >
                      Autoriser
                    </Button>
                  )}
                  <Switch
                    checked={preferences.browserNotifications && browserPermission === 'granted'}
                    disabled={browserPermission !== 'granted'}
                    onCheckedChange={(checked) =>
                      savePreferences({ browserNotifications: checked })
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* Fréquence */}
              <div className="space-y-3">
                <Label>Fréquence des notifications</Label>
                <Select
                  value={preferences.frequency}
                  onValueChange={(value: NotificationPreferences['frequency']) =>
                    savePreferences({ frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(frequencyLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Heures silencieuses */}
          <Card>
            <CardHeader>
              <CardTitle>Heures silencieuses</CardTitle>
              <CardDescription>
                Désactiver les notifications pendant certaines heures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Activer les heures silencieuses</Label>
                <Switch
                  checked={preferences.quietHours.enabled}
                  onCheckedChange={(checked) =>
                    savePreferences({
                      quietHours: { ...preferences.quietHours, enabled: checked },
                    })
                  }
                />
              </div>

              {preferences.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-time">Début</Label>
                    <input
                      id="start-time"
                      type="time"
                      value={preferences.quietHours.start}
                      onChange={(e) =>
                        savePreferences({
                          quietHours: {
                            ...preferences.quietHours,
                            start: e.target.value,
                          },
                        })
                      }
                      className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time">Fin</Label>
                    <input
                      id="end-time"
                      type="time"
                      value={preferences.quietHours.end}
                      onChange={(e) =>
                        savePreferences({
                          quietHours: {
                            ...preferences.quietHours,
                            end: e.target.value,
                          },
                        })
                      }
                      className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test */}
          <Card>
            <CardHeader>
              <CardTitle>Test</CardTitle>
              <CardDescription>
                Tester vos paramètres de notification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testNotification} variant="outline" className="w-full">
                <Bell className="w-4 h-4 mr-2" />
                Envoyer une notification de test
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
