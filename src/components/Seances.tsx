import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Filter, 
  Search,
  Edit2,
  Trash2,
  ChevronDown,
  BookOpen,
  GraduationCap,
  UserCheck,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/RichTextEditor';
import { RichTextViewer } from '@/components/RichTextViewer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { useSeances } from '../hooks/useSeances';
import { Seance } from '../types';
import { SupabaseSeance } from '../hooks/useSeances';
import { useAuth } from '../context/AuthContext';
import { SEANCE_TYPES, ALL_CRENEAUX } from '../types';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from './LoadingSpinner';
import { TutorName } from '@/components/TutorName';
import { SeanceForm } from './SeanceForm';
import { useAutoSave } from '../hooks/useAutoSave';
import { SeancesList } from './SeancesList';
import { SeanceFilters } from './SeanceFilters';
import { SeancesHeader } from './SeancesHeader';

/**
 * Helpers pour gérer le libellé personnalisé quand type = "autre".
 * On stocke le libellé au début des notes sous la forme: [Libellé] texte des notes...
 */
function parseCustomTypeFromNotes(notes: string): { customType?: string; strippedNotes: string } {
  if (!notes) return { strippedNotes: '' };
  const match = notes.match(/^\s*\[([^\]\n]{1,40})\]\s*/);
  if (match) {
    const customType = match[1].trim();
    const strippedNotes = notes.replace(match[0], '');
    return { customType, strippedNotes };
  }
  return { strippedNotes: notes };
}

function injectCustomTypeIntoNotes(notes: string, customType?: string): string {
  const clean = notes || '';
  const label = customType?.trim();
  if (label) {
    return `[${label}] ${clean}`.trim();
  }
  return clean;
}

export interface SeanceFormData {
  date: string;
  duree: number;
  type: Seance['type'];
  horaireMode?: 'ordinaire' | 'creneau';
  heure?: string;
  creneau?: typeof ALL_CRENEAUX[number] | '';
  notes: string;
  customType?: string; // utilisé uniquement côté UI lorsque type = "autre"
}

const defaultFormData: SeanceFormData = {
  date: new Date().toISOString().split('T')[0],
  duree: 1,
  type: 'visite',
  horaireMode: 'ordinaire',
  heure: '09:00',
  creneau: '',
  notes: '',
  customType: '',
};

export function Seances() {
  const { user } = useAuth();
  const { seances, isLoading: seancesLoading, fetchSeances, addSeance, updateSeance, deleteSeance } = useSeances();
  const { scheduleAutoSave, loadFromLocalStorage, clearAutoSave } = useAutoSave();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSeance, setEditingSeance] = useState<SupabaseSeance | null>(null);
  const [formData, setFormData] = useState<SeanceFormData>(defaultFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // On masque "formation" et "evaluation" dans le formulaire et les filtres
  const selectableSeanceTypes = useMemo(
    () => SEANCE_TYPES.filter(t => t.value !== 'formation' && t.value !== 'evaluation'),
    []
  );

  const filteredSeances = useMemo(() => {
    return seances.filter(seance => {
      const tutorName = seance.profiles?.display_name || `Utilisateur ${seance.tuteur_id.slice(-4)}`;
      const matchesSearch = seance.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tutorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || seance.type === typeFilter;
      return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [seances, searchTerm, typeFilter]);

  // Charger les séances au montage
  useEffect(() => {
    fetchSeances();
  }, [fetchSeances]);

  // Charger une auto-sauvegarde au montage si disponible
  useEffect(() => {
    if (!editingSeance) {
      const savedData = loadFromLocalStorage();
      if (savedData) {
        setFormData(savedData);
        toast.success('Brouillon récupéré automatiquement', { duration: 3000 });
      }
    }
  }, [loadFromLocalStorage, editingSeance]);

  // Auto-sauvegarde des données du formulaire
  useEffect(() => {
    if (isFormOpen && !editingSeance && formData.notes.length > 10) {
      scheduleAutoSave(formData);
    }
  }, [formData, isFormOpen, editingSeance, scheduleAutoSave]);

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingSeance(null);
    clearAutoSave();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // Préfixer les notes avec le libellé personnalisé si type = "autre"
      const notesToSave = formData.type === 'autre'
        ? injectCustomTypeIntoNotes(formData.notes, formData.customType)
        : formData.notes;

      const seanceData = {
        date: formData.date,
        duree: formData.duree,
        type: formData.type,
        horaire_mode: formData.horaireMode || 'ordinaire',
        ...(formData.horaireMode === 'creneau' && formData.creneau && { creneau: formData.creneau }),
        ...(formData.horaireMode === 'ordinaire' && { heure: formData.heure }),
        notes: notesToSave,
        shared_with_peers: true,
      };

      if (editingSeance) {
        await updateSeance(editingSeance.id, seanceData);
        toast.success('Séance modifiée avec succès');
      } else {
        await addSeance(seanceData);
        toast.success('Séance ajoutée avec succès');
      }

      setIsFormOpen(false);
      resetForm();
      clearAutoSave();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (seance: SupabaseSeance) => {
    setEditingSeance(seance);

    // Si type = "autre", on récupère le libellé personnalisé au début des notes
    let customType = '';
    let cleanNotes = seance.notes;
    if (seance.type === 'autre') {
      const { customType: ct, strippedNotes } = parseCustomTypeFromNotes(seance.notes);
      customType = ct || '';
      cleanNotes = strippedNotes;
    }

    setFormData({
      date: seance.date,
      duree: seance.duree,
      type: seance.type as Seance['type'],
      horaireMode: (seance.horaire_mode || 'ordinaire') as 'ordinaire' | 'creneau',
      heure: seance.heure || '09:00',
      creneau: (seance.creneau || '') as typeof ALL_CRENEAUX[number] | '',
      notes: cleanNotes,
      customType,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (seance: SupabaseSeance) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) {
      try {
        deleteSeance(seance.id);
        toast.success('Séance supprimée');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const canModify = (seance: SupabaseSeance) => {
    return user?.role === 'admin' || seance.tuteur_id === user?.id;
  };

  return (
    <div className="space-y-6">
      <SeancesHeader
        userRole={user?.role}
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        resetForm={resetForm}
        editingSeance={editingSeance as any}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />

      {/* Filters */}
      <SeanceFilters
        isFiltersOpen={isFiltersOpen}
        setIsFiltersOpen={setIsFiltersOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        selectableSeanceTypes={selectableSeanceTypes}
      />

      {/* Sessions List */}
      <SeancesList
        filteredSeances={filteredSeances}
        canModify={canModify}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        searchTerm={searchTerm}
        typeFilter={typeFilter}
        userRole={user?.role}
        resetForm={resetForm}
        setIsFormOpen={setIsFormOpen}
      />
    </div>
  );
}
