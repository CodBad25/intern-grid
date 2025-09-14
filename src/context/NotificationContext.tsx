import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, Calendar, FileText, Users, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface Notification {
  id: string;
  // Accept both legacy and normalized types for compatibility with existing components
  type: 'seance' | 'document' | 'comment' | 'response' | 'event' | 'system' | 'new_comment' | 'new_response' | 'new_document' | 'new_event';
  title: string;
  message: string;
  // Keep both timestamp and createdAt for compatibility with components that use createdAt
  timestamp: Date;
  createdAt?: string;
  read: boolean;
  priority?: 'low' | 'medium' | 'high';
  actionUrl?: string;
  userId?: string;
}

type FilterType =
  | 'all'
  | 'seance'
  | 'document'
  | 'comment'
  | 'response'
  | 'event'
  | 'system'
  | 'new_comment'
  | 'new_response'
  | 'new_document'
  | 'new_event';

type FilterStatus = 'all' | 'unread' | 'read';
type FilterTimeRange = 'all' | 'today' | 'week' | 'month';

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;

  // Existing actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  getNotificationIcon: (type: Notification['type']) => React.ComponentType;

  // Added API expected by NotificationDropdown
  filteredNotifications: Notification[];
  filters: {
    type: FilterType;
    status: FilterStatus;
    timeRange: FilterTimeRange;
  };
  setFilters: (filters: { type?: FilterType; status?: FilterStatus; timeRange?: FilterTimeRange }) => void;
  deleteNotification: (id: string) => void;
  refreshNotifications: () => void;
  navigateToContent: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filters, setFiltersState] = useState<NotificationContextType['filters']>({
    type: 'all',
    status: 'all',
    timeRange: 'all',
  });

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read' | 'createdAt'>) => {
    // If this notification targets a specific user different from the current user,
    // ignore it locally to avoid duplicates meant for other recipients.
    if (notificationData.userId && user?.id && notificationData.userId !== user.id) {
      return;
    }

    const now = new Date();
    const newNotification: Notification = {
      ...notificationData,
      id: `notification_${Date.now()}_${Math.random()}`,
      timestamp: now,
      createdAt: now.toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep only 50 most recent
  }, [user?.id]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const getNotificationIcon = useCallback((type: Notification['type']) => {
    switch (type) {
      case 'seance':
        return Calendar;
      case 'document':
      case 'new_document':
        return FileText;
      case 'comment':
      case 'new_comment':
        return MessageSquare;
      case 'response':
      case 'new_response':
        return MessageSquare;
      case 'event':
      case 'new_event':
        return Users;
      case 'system':
        return AlertTriangle;
      default:
        return Bell;
    }
  }, []);

  // Filters logic to match NotificationDropdown expectations
  const setFilters = useCallback((patch: Partial<NotificationContextType['filters']>) => {
    setFiltersState(prev => ({ ...prev, ...patch }));
  }, []);

  const filteredNotifications = useMemo(() => {
    const now = new Date();

    const matchesType = (n: Notification) => {
      if (filters.type === 'all') return true;
      return n.type === filters.type;
    };

    const matchesStatus = (n: Notification) => {
      if (filters.status === 'all') return true;
      return filters.status === 'unread' ? !n.read : n.read;
    };

    const matchesTime = (n: Notification) => {
      if (filters.timeRange === 'all') return true;

      const created = n.timestamp instanceof Date ? n.timestamp : new Date(n.createdAt || Date.now());
      const diffMs = now.getTime() - created.getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      switch (filters.timeRange) {
        case 'today':
          return diffMs < oneDay;
        case 'week':
          return diffMs < 7 * oneDay;
        case 'month':
          return diffMs < 30 * oneDay;
        default:
          return true;
      }
    };

    return notifications.filter(n => matchesType(n) && matchesStatus(n) && matchesTime(n));
  }, [notifications, filters]);

  // Simple refresh that could refetch from a backend in the future
  const refreshNotifications = useCallback(() => {
    // No backend yet; keep as no-op to satisfy UI hook.
    // We can still trigger a state update to ensure UI refresh
    setNotifications(prev => [...prev]);
  }, []);

  // Simple navigation helper; leverage actionUrl if provided
  const navigateToContent = useCallback((notification: Notification) => {
    markAsRead(notification.id);
    const targetUrl = notification.actionUrl || '/';

    // Basic routing logic, can be expanded
    if (targetUrl.startsWith('/#')) {
      const hash = targetUrl.substring(1); // Remove leading '/'
      navigate(hash);
    } else {
      navigate(targetUrl);
    }
  }, [navigate, markAsRead]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getNotificationIcon,

    // Added API
    filteredNotifications,
    filters,
    setFilters,
    deleteNotification: removeNotification,
    refreshNotifications,
    navigateToContent,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
