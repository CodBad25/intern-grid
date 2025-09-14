
import React from 'react';
import { Bell, Check, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800';
      case 'error': return 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800';
      default: return 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800';
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5" />
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs"
          >
            <CheckCheck className="w-4 h-4 mr-1" />
            Tout lire
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-96">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Bell className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Aucune notification</p>
          </div>
        ) : (
          <div className="p-2">
            {notifications.map((notification, index) => (
              <div key={notification.id} className="space-y-2">
                <div
                  className={`p-3 rounded-lg border transition-all ${
                    notification.read 
                      ? 'bg-background border-border' 
                      : getNotificationColor(notification.type)
                  }`}
                >
                  {/* Notification Content */}
                  <div className="flex items-start space-x-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2">
                        {notification.content}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          {notification.action_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-6 px-2"
                            >
                              <Link to={notification.action_url}>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </Button>
                          )}
                          
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-6 px-2"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-6 px-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {index < notifications.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
