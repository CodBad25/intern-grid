import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

const AUTOSAVE_KEY = 'seance_draft';
const AUTOSAVE_INTERVAL = 10000; // 10 secondes

export interface AutoSaveData {
  formData: any;
  timestamp: number;
  userId: string;
}

export function useAutoSave() {
  const { user } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const saveToLocalStorage = (data: any) => {
    if (!user) return;
    
    const autoSaveData: AutoSaveData = {
      formData: data,
      timestamp: Date.now(),
      userId: user.id
    };
    
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(autoSaveData));
  };

  const loadFromLocalStorage = () => {
    if (!user) return null;
    
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (!saved) return null;
      
      const autoSaveData: AutoSaveData = JSON.parse(saved);
      
      // Vérifier que c'est pour le bon utilisateur et pas trop ancien (24h)
      if (autoSaveData.userId === user.id && 
          Date.now() - autoSaveData.timestamp < 24 * 60 * 60 * 1000) {
        return autoSaveData.formData;
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'auto-sauvegarde:', error);
    }
    
    return null;
  };

  const clearAutoSave = () => {
    localStorage.removeItem(AUTOSAVE_KEY);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const scheduleAutoSave = (data: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      saveToLocalStorage(data);
    }, AUTOSAVE_INTERVAL);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    scheduleAutoSave,
    loadFromLocalStorage,
    clearAutoSave
  };
}