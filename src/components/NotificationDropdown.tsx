import React, { useState } from 'react';
import { Bell, Check, Trash2, X, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function NotificationDropdown() {
  const { 
    filteredNotifications, 
    unreadCount, 
    filters, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications,
    setFilters,
    refreshNotifications,
    navigateToContent
  } = useNotifications();
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);

  if (!user) return null;

  // Trier et limiter les notifications filtrées
  const displayNotifications = filteredNotifications
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20); // Afficher plus de notifications avec les filtres

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_comment':
        return '💬';
      case 'new_response':
        return '✅';
      case 'new_document':
        return '📄';
      case 'new_event':
        return '📅';
      default:
        return '🔔';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshNotifications}
              className="h-8 w-8 p-0"
              title="Actualiser"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 w-8 p-0"
              title="Filtres"
            >
              <Filter className="h-3 w-3" />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Tout marquer lu
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="p-3 border-b bg-muted/50 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium mb-1 block">Type</label>
                <Select value={filters.type} onValueChange={(value: any) => setFilters({...filters, type: value})}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="new_comment">Commentaires</SelectItem>
                    <SelectItem value="new_response">Réponses</SelectItem>
                    <SelectItem value="new_document">Documents</SelectItem>
                    <SelectItem value="new_event">Événements</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Statut</label>
                <Select value={filters.status} onValueChange={(value: any) => setFilters({...filters, status: value})}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="unread">Non lus</SelectItem>
                    <SelectItem value="read">Lus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Période</label>
              <Select value={filters.timeRange} onValueChange={(value: any) => setFilters({...filters, timeRange: value})}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {displayNotifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {filters.type === 'all' && filters.status === 'all' && filters.timeRange === 'all' 
              ? 'Aucune notification' 
              : 'Aucune notification correspondant aux filtres'}
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <div className="px-3 py-2 text-xs text-muted-foreground border-b">
              {displayNotifications.length} notification{displayNotifications.length > 1 ? 's' : ''} 
              {filters.type === 'all' && filters.status === 'all' && filters.timeRange === 'all' ? '' : ' (filtrées)'}
            </div>
            {displayNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${!notification.read ? 'bg-accent/50' : ''}`}
                onClick={() => navigateToContent(notification)}
              >
                <div className="flex items-start gap-3 w-full">
                  <span className="text-lg flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">
                        {notification.title}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        {displayNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={clearAllNotifications}
              className="p-3 text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Effacer toutes les notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}