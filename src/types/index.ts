
// POINT DE RESTAURATION - AVANT NETTOYAGE CODE LEGACY - 2024-08-19
// Ce commentaire marque un point de sauvegarde avant suppression de DEMO_USERS et Login.tsx

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'tuteur' | 'admin' | 'stagiaire';
  color?: string;
}

export interface Seance {
  id: string;
  date: string;
  duree: number;
  type: 'visite' | 'formation' | 'evaluation' | 'suivi' | 'autre';
  horaireMode?: 'ordinaire' | 'creneau';
  heure?: string;
  creneau?: 'M1' | 'M2' | 'M3' | 'M4' | 'S1' | 'S2' | 'S3' | 'S4';
  notes: string;
  custom_label?: string; // Label personnalisé pour affiner le type (ex: "Tréunion")
  tuteurId: string;
  tuteurName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  titre: string;
  type: 'document' | 'lien';
  url?: string;
  description: string;
  tuteurId: string;
  tuteurName: string;
  sharedWithPeers?: boolean; // ✅ Ajout du champ manquant
  createdAt: string;
}

export interface Commentaire {
  id: string;
  type: 'remarque' | 'question';
  content: string;
  tuteurId: string;
  tuteurName: string;
  createdAt: string;
}

export interface Reaction {
  id: string;
  type: 'heart' | 'thumbs_up' | 'thumbs_down' | 'smile' | 'laugh' | 'frown';
  userId: string;
  userName: string;
  targetId: string; // ID du commentaire ou de la réponse
  targetType: 'comment' | 'response';
  createdAt: string;
}

export interface Reponse {
  id: string;
  commentaireId: string;
  content: string;
  tuteurId: string;
  tuteurName: string;
  sharedWithPeers: boolean;
  createdAt: string;
}

export interface Evenement {
  id: string;
  titre: string;
  description: string;
  date: string;
  type: 'reunion' | 'formation' | 'evaluation' | 'autre';
  tuteurId: string;
  tuteurName: string;
  createdAt: string;
}

export const CRENEAUX_MATIN = ['M1', 'M2', 'M3', 'M4'] as const;
export const CRENEAUX_SOIR = ['S1', 'S2', 'S3', 'S4'] as const;
export const ALL_CRENEAUX = [...CRENEAUX_MATIN, ...CRENEAUX_SOIR] as const;

export const CLASSES = ['6B', '4B'] as const;

export const SEANCE_TYPES = [
  { value: 'visite', label: 'Visite' },
  { value: 'formation', label: 'Formation' },
  { value: 'evaluation', label: 'Évaluation' },
  { value: 'suivi', label: 'Suivi' },
  { value: 'autre', label: 'Autre' }
] as const;

export const TUTOR_COLORS = [
  { value: 'hsl(220, 90%, 56%)', label: 'Bleu' },
  { value: 'hsl(142, 76%, 36%)', label: 'Vert' },
  { value: 'hsl(271, 91%, 65%)', label: 'Violet' },
  { value: 'hsl(346, 77%, 49%)', label: 'Rose' },
  { value: 'hsl(25, 95%, 53%)', label: 'Orange' },
  { value: 'hsl(262, 83%, 58%)', label: 'Indigo' },
  { value: 'hsl(173, 58%, 39%)', label: 'Teal' },
  { value: 'hsl(43, 96%, 56%)', label: 'Jaune' }
] as const;
