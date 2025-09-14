import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Seance, Document, Commentaire, Reponse, Evenement, Reaction } from '../types';
import { supabase } from '../integrations/supabase/client';

interface DataContextType {
  seances: Seance[];
  documents: Document[];
  commentaires: Commentaire[];
  reponses: Reponse[];
  evenements: Evenement[];
  reactions: Reaction[];
  isLoading: boolean;
  
  addSeance: (seance: Omit<Seance, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSeance: (id: string, seance: Partial<Seance>) => void;
  deleteSeance: (id: string) => void;
  
  addDocument: (document: Omit<Document, 'id' | 'createdAt'>, sendNotification?: boolean) => void;
  deleteDocument: (id: string) => void;
  
  addCommentaire: (commentaire: Omit<Commentaire, 'id' | 'createdAt'>, sendNotification?: boolean) => void;
  updateCommentaire: (id: string, content: string) => void;
  deleteCommentaire: (id: string) => void;
  
  addReponse: (reponse: Omit<Reponse, 'id' | 'createdAt'>, sendNotification?: boolean) => void;
  updateReponse: (id: string, reponse: Partial<Reponse>) => void;
  deleteReponse: (id: string) => void;
  
  addEvenement: (evenement: Omit<Evenement, 'id' | 'createdAt'>, sendNotification?: boolean) => void;
  deleteEvenement: (id: string) => void;
  
  addReaction: (reaction: Omit<Reaction, 'id' | 'createdAt'>) => void;
  removeReaction: (id: string) => void;
  getReactionsForTarget: (targetId: string, targetType: 'comment' | 'response') => Reaction[];
  
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  
  getStats: () => {
    totalHeures: number;
    nombreSeances: number;
    questionsEnAttente: number;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  seances: 'stagiaires_seances-v2',
  documents: 'stagiaires_documents-v2',
  commentaires: 'stagiaires_commentaires-v2',
  reponses: 'stagiaires_reponses-v2',
  evenements: 'stagiaires_evenements-v2',
  reactions: 'stagiaires_reactions-v2',
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [seances, setSeances] = useState<Seance[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [reponses, setReponses] = useState<Reponse[]>([]);
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync data with Supabase on startup
  useEffect(() => {
    const syncData = async () => {
      if (!navigator.onLine) {
        console.log('Offline, loading from localStorage...');
        loadDataFromStorage();
        return;
      }

      console.log('Online, syncing data from Supabase to localStorage...');

      const transformSeance = (s: any): Seance => ({ ...s, tuteurId: s.tuteur_id, tuteurName: s.profiles?.display_name, createdAt: s.created_at, updatedAt: s.updated_at, horaireMode: s.horaire_mode });
      const transformDocument = (d: any): Document => ({ ...d, tuteurId: d.tuteur_id, tuteurName: d.profiles?.display_name, createdAt: d.created_at });
      const transformCommentaire = (c: any): Commentaire => ({ ...c, tuteurId: c.tuteur_id, tuteurName: c.profiles?.display_name, createdAt: c.created_at });
      const transformReponse = (r: any): Reponse => ({ ...r, commentaireId: r.commentaire_id, tuteurId: r.tuteur_id, tuteurName: r.profiles?.display_name, sharedWithPeers: r.shared_with_peers, createdAt: r.created_at });
      const transformEvenement = (e: any): Evenement => ({ ...e, tuteurId: e.tuteur_id, tuteurName: e.profiles?.display_name, createdAt: e.created_at });
      const transformReaction = (r: any): Reaction => ({ ...r, userId: r.user_id, userName: r.profiles?.display_name, targetId: r.target_id, targetType: r.target_type, createdAt: r.created_at });

      const { data: seancesData, error: seancesError } = await supabase.from('seances').select('*, profiles:tuteur_id(display_name)');
      if (seancesError) console.error('Error fetching seances:', seancesError);
      else {
        const transformed = seancesData.map(transformSeance);
        setSeances(transformed);
        saveToStorage(STORAGE_KEYS.seances, transformed);
      }

      const { data: documentsData, error: documentsError } = await supabase.from('documents').select('*, profiles:tuteur_id(display_name)');
      if (documentsError) console.error('Error fetching documents:', documentsError);
      else {
        const transformed = documentsData.map(transformDocument);
        setDocuments(transformed);
        saveToStorage(STORAGE_KEYS.documents, transformed);
      }

      const { data: commentairesData, error: commentairesError } = await supabase.from('commentaires').select('*, profiles:tuteur_id(display_name)');
      if (commentairesError) console.error('Error fetching commentaires:', commentairesError);
      else {
        const transformed = commentairesData.map(transformCommentaire);
        setCommentaires(transformed);
        saveToStorage(STORAGE_KEYS.commentaires, transformed);
      }

      const { data: reponsesData, error: reponsesError } = await supabase.from('reponses').select('*, profiles:tuteur_id(display_name)');
      if (reponsesError) console.error('Error fetching reponses:', reponsesError);
      else {
        const transformed = reponsesData.map(transformReponse);
        setReponses(transformed);
        saveToStorage(STORAGE_KEYS.reponses, transformed);
      }

      const { data: evenementsData, error: evenementsError } = await supabase.from('evenements').select('*, profiles:tuteur_id(display_name)');
      if (evenementsError) console.error('Error fetching evenements:', evenementsError);
      else {
        const transformed = evenementsData.map(transformEvenement);
        setEvenements(transformed);
        saveToStorage(STORAGE_KEYS.evenements, transformed);
      }

      const { data: reactionsData, error: reactionsError } = await supabase.from('reactions').select('*, profiles:user_id(display_name)');
      if (reactionsError) console.error('Error fetching reactions:', reactionsError);
      else {
        const transformed = reactionsData.map(transformReaction);
        setReactions(transformed);
        saveToStorage(STORAGE_KEYS.reactions, transformed);
      }

      console.log('Data sync complete.');
      setIsLoading(false);
    };

    const loadDataFromStorage = () => {
      const loadData = (key: string, setter: (data: any[]) => void) => {
        try {
          const saved = localStorage.getItem(key);
          if (saved) {
            const parsed = JSON.parse(saved);
            setter(Array.isArray(parsed) ? parsed : []);
          }
        } catch (error) {
          console.error(`Error loading ${key}:`, error);
          setter([]);
        }
      };

      loadData(STORAGE_KEYS.seances, setSeances);
      loadData(STORAGE_KEYS.documents, setDocuments);
      loadData(STORAGE_KEYS.commentaires, setCommentaires);
      loadData(STORAGE_KEYS.reponses, setReponses);
      loadData(STORAGE_KEYS.evenements, setEvenements);
      loadData(STORAGE_KEYS.reactions, setReactions);
      setIsLoading(false);
    };

    syncData();
  }, []);

  // Save to localStorage
  const saveToStorage = (key: string, data: any[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  // Seances
  const addSeance = (seanceData: Omit<Seance, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSeance: Seance = {
      ...seanceData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...seances, newSeance];
    setSeances(updated);
    saveToStorage(STORAGE_KEYS.seances, updated);
  };

  const updateSeance = (id: string, seanceData: Partial<Seance>) => {
    const updated = seances.map(s => 
      s.id === id 
        ? { ...s, ...seanceData, updatedAt: new Date().toISOString() }
        : s
    );
    setSeances(updated);
    saveToStorage(STORAGE_KEYS.seances, updated);
  };

  const deleteSeance = (id: string) => {
    const updated = seances.filter(s => s.id !== id);
    setSeances(updated);
    saveToStorage(STORAGE_KEYS.seances, updated);
  };

  // Documents
  const addDocument = (documentData: Omit<Document, 'id' | 'createdAt'>, sendNotification: boolean = true) => {
    const newDocument: Document = {
      ...documentData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...documents, newDocument];
    setDocuments(updated);
    saveToStorage(STORAGE_KEYS.documents, updated);
  };

  const deleteDocument = (id: string) => {
    const updated = documents.filter(d => d.id !== id);
    setDocuments(updated);
    saveToStorage(STORAGE_KEYS.documents, updated);
  };

  // Commentaires
  const addCommentaire = (commentaireData: Omit<Commentaire, 'id' | 'createdAt'>, sendNotification: boolean = true) => {
    const newCommentaire: Commentaire = {
      ...commentaireData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...commentaires, newCommentaire];
    setCommentaires(updated);
    saveToStorage(STORAGE_KEYS.commentaires, updated);
  };

  const updateCommentaire = (id: string, content: string) => {
    const updated = commentaires.map(c => 
      c.id === id ? { ...c, content } : c
    );
    setCommentaires(updated);
    saveToStorage(STORAGE_KEYS.commentaires, updated);
  };

  const deleteCommentaire = (id: string) => {
    const updated = commentaires.filter(c => c.id !== id);
    setCommentaires(updated);
    saveToStorage(STORAGE_KEYS.commentaires, updated);
    
    // Also delete associated responses
    const updatedReponses = reponses.filter(r => r.commentaireId !== id);
    setReponses(updatedReponses);
    saveToStorage(STORAGE_KEYS.reponses, updatedReponses);
  };

  // Reponses
  const addReponse = (reponseData: Omit<Reponse, 'id' | 'createdAt'>, sendNotification: boolean = true) => {
    const newReponse: Reponse = {
      ...reponseData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...reponses, newReponse];
    setReponses(updated);
    saveToStorage(STORAGE_KEYS.reponses, updated);
  };

  const updateReponse = (id: string, reponseData: Partial<Reponse>) => {
    const updated = reponses.map(r => 
      r.id === id ? { ...r, ...reponseData } : r
    );
    setReponses(updated);
    saveToStorage(STORAGE_KEYS.reponses, updated);
  };

  const deleteReponse = (id: string) => {
    const updated = reponses.filter(r => r.id !== id);
    setReponses(updated);
    saveToStorage(STORAGE_KEYS.reponses, updated);
  };

  // Evenements
  const addEvenement = (evenementData: Omit<Evenement, 'id' | 'createdAt'>, sendNotification: boolean = true) => {
    const newEvenement: Evenement = {
      ...evenementData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...evenements, newEvenement];
    setEvenements(updated);
    saveToStorage(STORAGE_KEYS.evenements, updated);
  };

  const deleteEvenement = (id: string) => {
    const updated = evenements.filter(e => e.id !== id);
    setEvenements(updated);
    saveToStorage(STORAGE_KEYS.evenements, updated);
  };

  // Export/Import
  const exportData = () => {
    const data = {
      seances,
      documents,
      commentaires,
      reponses,
      evenements,
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importData = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.seances) {
        setSeances(data.seances);
        saveToStorage(STORAGE_KEYS.seances, data.seances);
      }
      if (data.documents) {
        setDocuments(data.documents);
        saveToStorage(STORAGE_KEYS.documents, data.documents);
      }
      if (data.commentaires) {
        setCommentaires(data.commentaires);
        saveToStorage(STORAGE_KEYS.commentaires, data.commentaires);
      }
      if (data.reponses) {
        setReponses(data.reponses);
        saveToStorage(STORAGE_KEYS.reponses, data.reponses);
      }
      if (data.evenements) {
        setEvenements(data.evenements);
        saveToStorage(STORAGE_KEYS.evenements, data.evenements);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  };

  // Reactions
  const addReaction = (reactionData: Omit<Reaction, 'id' | 'createdAt'>) => {
    const newReaction: Reaction = {
      ...reactionData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...reactions, newReaction];
    setReactions(updated);
    saveToStorage(STORAGE_KEYS.reactions, updated);
  };

  const removeReaction = (id: string) => {
    const updated = reactions.filter(r => r.id !== id);
    setReactions(updated);
    saveToStorage(STORAGE_KEYS.reactions, updated);
  };

  const getReactionsForTarget = (targetId: string, targetType: 'comment' | 'response') => {
    return reactions.filter(r => r.targetId === targetId && r.targetType === targetType);
  };

  // Statistics
  const getStats = () => {
    const totalHeures = seances.reduce((sum, seance) => sum + seance.duree, 0);
    const nombreSeances = seances.length;
    
    // Questions without responses
    const questionsIds = new Set(
      commentaires
        .filter(c => c.type === 'question')
        .map(c => c.id)
    );
    const reponsesIds = new Set(reponses.map(r => r.commentaireId));
    const questionsEnAttente = questionsIds.size - 
      Array.from(questionsIds).filter(id => reponsesIds.has(id)).length;

    return {
      totalHeures,
      nombreSeances,
      questionsEnAttente,
    };
  };

  return (
    <DataContext.Provider value={{
      seances,
      documents,
      commentaires,
      reponses,
      evenements,
      reactions,
      isLoading,
      addSeance,
      updateSeance,
      deleteSeance,
      addDocument,
      deleteDocument,
      addCommentaire,
      updateCommentaire,
      deleteCommentaire,
      addReponse,
      updateReponse,
      deleteReponse,
      addEvenement,
      deleteEvenement,
      addReaction,
      removeReaction,
      getReactionsForTarget,
      exportData,
      importData,
      getStats,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
