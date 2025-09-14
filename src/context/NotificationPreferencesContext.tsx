import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';

export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  browserNotifications: boolean;
  emailNotifications: boolean;
  types: {
    new_comment: boolean;
    new_response: boolean;
    new_document: boolean;
    new_event: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'instant' | 'hourly' | 'daily';
}

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  sound: true,
  browserNotifications: true,
  emailNotifications: false,
  types: {
    new_comment: true,
    new_response: true,
    new_document: true,
    new_event: true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  frequency: 'instant',
};

interface NotificationPreferencesContextType {
  preferences: NotificationPreferences;
  savePreferences: (newPreferences: Partial<NotificationPreferences>) => void;
  isNotificationPermitted: (type: keyof NotificationPreferences['types']) => boolean;
}

const NotificationPreferencesContext = createContext<NotificationPreferencesContextType | undefined>(undefined);

export function useNotificationPreferences() {
  const context = useContext(NotificationPreferencesContext);
  if (!context) {
    throw new Error('useNotificationPreferences must be used within a NotificationPreferencesProvider');
  }
  return context;
}

export function NotificationPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem('notification_preferences');
      return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  const savePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPreferences };
      localStorage.setItem('notification_preferences', JSON.stringify(updated));
      toast.success('Préférences de notification mises à jour');
      return updated;
    });
  }, []);

  const isNotificationPermitted = useCallback((type: keyof NotificationPreferences['types']) => {
    if (!preferences.enabled) return false;
    if (!preferences.types[type]) return false;

    if (preferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const [startHour, startMinute] = preferences.quietHours.start.split(':').map(Number);
      const startTime = startHour * 60 + startMinute;

      const [endHour, endMinute] = preferences.quietHours.end.split(':').map(Number);
      const endTime = endHour * 60 + endMinute;

      // Handle overnight quiet hours
      if (startTime > endTime) {
        if (currentTime >= startTime || currentTime < endTime) {
          return false;
        }
      } else {
        if (currentTime >= startTime && currentTime < endTime) {
          return false;
        }
      }
    }

    return true;
  }, [preferences]);

  const value = useMemo(() => ({
    preferences,
    savePreferences,
    isNotificationPermitted,
  }), [preferences, savePreferences, isNotificationPermitted]);

  return (
    <NotificationPreferencesContext.Provider value={value}>
      {children}
    </NotificationPreferencesContext.Provider>
  );
}
