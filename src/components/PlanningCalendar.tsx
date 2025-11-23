import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Eye, UserCheck, Plus, Pencil, Trash2, BookOpen, GraduationCap, MoreHorizontal } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useSeances } from '@/hooks/useSeances';
import { useProfiles } from '@/hooks/useProfiles';
import { SeanceForm } from './SeanceForm';
import { Seance } from '@/types';
import { ALL_CRENEAUX } from '@/types';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, isSameMonth
} from 'date-fns';
import { fr } from 'date-fns/locale';

const CRENEAUX = ['M1', 'M2', 'M3', 'M4', 'S1', 'S2', 'S3', 'S4'] as const;
const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'] as const;

const CRENEAU_COLORS = {
  M1: 'bg-orange-100 text-orange-800 border-orange-300',
  M2: 'bg-orange-200 text-orange-900 border-orange-400',
  M3: 'bg-orange-100 text-orange-800 border-orange-300',
  M4: 'bg-orange-200 text-orange-900 border-orange-400',
  S1: 'bg-purple-100 text-purple-800 border-purple-300',
  S2: 'bg-purple-200 text-purple-900 border-purple-400',
  S3: 'bg-purple-100 text-purple-800 border-purple-300',
  S4: 'bg-purple-200 text-purple-900 border-purple-400',
};

const TYPE_ICONS = {
  visite: Eye,
  suivi: UserCheck,
  formation: BookOpen,
  evaluation: GraduationCap,
  autre: MoreHorizontal,
};

type ViewMode = 'semaine' | 'mois';

interface SeanceFormData {
  date: string;
  duree: number;
  type: Seance['type'];
  horaireMode?: 'ordinaire' | 'creneau';
  heure?: string;
  creneau?: typeof ALL_CRENEAUX[number] | '';
  notes: string;
  customType?: string;
  customLabel?: string;
  classeVisitee?: string;
}

const defaultFormData: SeanceFormData = {
  date: new Date().toISOString().split('T')[0],
  duree: 1,
  type: 'visite',
  horaireMode: 'creneau',
  heure: '',
  creneau: '',
  notes: '',
  customLabel: '',
  classeVisitee: '',
  sharedWithPeers: false,
};

export function PlanningCalendar() {
  const { seances } = useData();
  const { user } = useAuth();
  const { addSeance, updateSeance, deleteSeance } = useSeances();
  const { getProfile, profiles } = useProfiles();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('semaine');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSeance, setEditingSeance] = useState<Seance | null>(null);
  const [viewingSeance, setViewingSeance] = useState<Seance | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState<SeanceFormData>(defaultFormData);
  const [isLoading, setIsLoading] = useState(false);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingSeance(null);
  };

  // Ouvrir le dialogue de visualisation (lecture seule)
  const openViewDialog = (seance: Seance, e: React.MouseEvent) => {
    e.stopPropagation();
    setViewingSeance(seance);
    setIsViewDialogOpen(true);
  };

  // Ouvrir le formulaire pour éditer une séance
  const openEditForm = (seance: Seance, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSeance(seance);
    setFormData({
      date: seance.date,
      duree: seance.duree,
      type: seance.type,
      horaireMode: seance.heure ? 'ordinaire' : 'creneau',
      heure: seance.heure || '',
      creneau: seance.creneau || '',
      notes: seance.notes || '',
      customLabel: seance.custom_label || '',
      classeVisitee: seance.classe_visitee || '',
      sharedWithPeers: seance.shared_with_peers || false,
    });
    setIsFormOpen(true);
  };

  // Gérer le clic sur une séance
  const handleSeanceClick = (seance: Seance, e: React.MouseEvent) => {
    const isCreator = seance.tuteur_id === user?.id;
    const isShared = seance.shared_with_peers || false;
    const canEdit = isTutor && (isCreator || isShared);
    if (canEdit) {
      openEditForm(seance, e);
    } else {
      openViewDialog(seance, e);
    }
  };

  // Supprimer une séance
  const handleDeleteSeance = async (seanceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) return;

    try {
      await deleteSeance(seanceId);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Ouvrir le formulaire avec date et créneau pré-remplis
  const openFormWithPreset = (date: Date, creneau: string) => {
    setFormData({
      ...defaultFormData,
      date: format(date, 'yyyy-MM-dd'),
      creneau: creneau as typeof ALL_CRENEAUX[number],
    });
    setIsFormOpen(true);
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const seanceData = {
        date: formData.date,
        duree: formData.duree,
        type: formData.type,
        heure: formData.horaireMode === 'ordinaire' ? formData.heure : null,
        creneau: formData.horaireMode === 'creneau' ? formData.creneau : null,
        notes: formData.notes,
        // custom_label: formData.customLabel || null, // Décommentez après avoir appliqué la migration SQL
        classe_visitee: formData.classeVisitee || null,
        shared_with_peers: formData.sharedWithPeers || false,
      };

      if (editingSeance) {
        await updateSeance(editingSeance.id, seanceData);
      } else {
        await addSeance(seanceData);
      }
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la séance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isTutor = user?.role === 'tuteur' || user?.role === 'admin';

  // Fonction pour obtenir le style avec la couleur du tuteur et nuance selon le type
  const getTutorColorStyle = (tuteurId: string, type: string, isShared?: boolean) => {
    const profile = getProfile(tuteurId);
    const color = profile?.color || '#6366f1';

    // Extraire les valeurs HSL
    const getHSL = (colorStr: string) => {
      if (colorStr.startsWith('hsl')) {
        const match = colorStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (match) {
          return {
            h: parseInt(match[1]),
            s: parseInt(match[2]),
            l: parseInt(match[3])
          };
        }
      }
      // Couleur par défaut si pas HSL
      return { h: 220, s: 90, l: 56 };
    };

    const hsl = getHSL(color);

    // Nuances selon le type - variation de la luminosité et saturation
    let lightness = hsl.l;
    let saturation = hsl.s;
    let bgOpacity = 0.25;
    let borderWidth = '2px';
    let borderStyle = 'solid';

    switch (type) {
      case 'visite':
        lightness = Math.min(hsl.l + 5, 70); // Ton moyen-clair
        saturation = Math.min(hsl.s + 10, 85);
        bgOpacity = 0.35;
        borderWidth = '3px';
        borderStyle = 'solid';
        break;
      case 'suivi':
        lightness = Math.min(hsl.l + 20, 85); // Ton très clair/pastel
        saturation = Math.max(hsl.s - 15, 40);
        bgOpacity = 0.3;
        borderWidth = '2px';
        borderStyle = 'dashed';
        break;
      case 'formation':
        lightness = Math.min(hsl.l + 10, 75); // Légèrement plus clair
        saturation = hsl.s;
        bgOpacity = 0.3;
        borderWidth = '2px';
        borderStyle = 'double';
        break;
      case 'evaluation':
        lightness = Math.min(hsl.l + 8, 72);
        saturation = Math.min(hsl.s + 5, 80);
        bgOpacity = 0.35;
        borderWidth = '3px';
        borderStyle = 'solid';
        break;
      case 'autre':
        lightness = Math.min(hsl.l + 15, 78);
        saturation = Math.max(hsl.s - 10, 50);
        bgOpacity = 0.28;
        borderWidth = '2px';
        borderStyle = 'dotted';
        break;
    }

    const bgColor1 = `hsl(${hsl.h}, ${saturation}%, ${lightness}%, ${bgOpacity})`;
    const borderColor = `hsl(${hsl.h}, ${saturation}%, ${Math.max(lightness - 20, 10)}%)`;

    // Si c'est une séance partagée, créer un dégradé avec les couleurs des deux tuteurs
    if (isShared && profiles) {
      // Trouver l'autre tuteur (celui qui n'est pas le créateur)
      const otherProfile = profiles.find(p => p.user_id !== tuteurId && p.role === 'tuteur');

      if (otherProfile) {
        const color2 = otherProfile.color || '#22c55e';
        const hsl2 = getHSL(color2);

        // Appliquer les mêmes nuances à la deuxième couleur
        let lightness2 = hsl2.l;
        let saturation2 = hsl2.s;

        switch (type) {
          case 'visite':
            lightness2 = Math.min(hsl2.l + 5, 70);
            saturation2 = Math.min(hsl2.s + 10, 85);
            break;
          case 'suivi':
            lightness2 = Math.min(hsl2.l + 20, 85);
            saturation2 = Math.max(hsl2.s - 15, 40);
            break;
          case 'formation':
            lightness2 = Math.min(hsl2.l + 10, 75);
            saturation2 = hsl2.s;
            break;
          case 'evaluation':
            lightness2 = Math.min(hsl2.l + 8, 72);
            saturation2 = Math.min(hsl2.s + 5, 80);
            break;
          case 'autre':
            lightness2 = Math.min(hsl2.l + 15, 78);
            saturation2 = Math.max(hsl2.s - 10, 50);
            break;
        }

        const bgColor2 = `hsl(${hsl2.h}, ${saturation2}%, ${lightness2}%, ${bgOpacity})`;

        return {
          background: `linear-gradient(90deg, ${bgColor1} 0%, ${bgColor2} 100%)`,
          borderLeft: `${borderWidth} ${borderStyle} ${borderColor}`,
          color: borderColor,
        };
      }
    }

    return {
      backgroundColor: bgColor1,
      borderLeft: `${borderWidth} ${borderStyle} ${borderColor}`,
      color: borderColor,
    };
  };

  // Afficher toutes les séances (plus seulement visite/suivi)
  const filteredSeances = useMemo(() => {
    return seances; // On affiche tout maintenant !
  }, [seances]);

  // Navigation
  const goToPrevious = () => {
    if (viewMode === 'semaine') {
      setCurrentDate(prev => subWeeks(prev, 1));
    } else {
      setCurrentDate(prev => subMonths(prev, 1));
    }
  };

  const goToNext = () => {
    if (viewMode === 'semaine') {
      setCurrentDate(prev => addWeeks(prev, 1));
    } else {
      setCurrentDate(prev => addMonths(prev, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calcul des jours pour la vue semaine
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 5 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  // Calcul des jours pour la vue mois
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const firstDay = startOfWeek(start, { weekStartsOn: 1 });
    const lastDay = endOfWeek(end, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: firstDay, end: lastDay });
  }, [currentDate]);

  // Obtenir les séances pour un jour et un créneau
  const getSeancesForDayAndCreneau = (day: Date, creneau: string) => {
    return filteredSeances.filter(s => {
      const seanceDate = new Date(s.date);
      return isSameDay(seanceDate, day) && s.creneau === creneau;
    });
  };

  // Obtenir toutes les séances pour un jour (vue mois)
  const getSeancesForDay = (day: Date) => {
    return filteredSeances.filter(s => {
      const seanceDate = new Date(s.date);
      return isSameDay(seanceDate, day);
    });
  };

  // Titre de la période
  const periodTitle = useMemo(() => {
    if (viewMode === 'semaine') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, 'd', { locale: fr })} - ${format(end, 'd MMMM yyyy', { locale: fr })}`;
    } else {
      return format(currentDate, 'MMMM yyyy', { locale: fr });
    }
  }, [currentDate, viewMode]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Planning des visites et suivis
          </CardTitle>
          <div className="flex items-center gap-3">
            {isTutor && (
              <Button
                onClick={() => { resetForm(); setIsFormOpen(true); }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Visite/Suivi
              </Button>
            )}
            <Button
              variant={viewMode === 'semaine' ? 'default' : 'outline'}
              onClick={() => setViewMode('semaine')}
            >
              Semaine
            </Button>
            <Button
              variant={viewMode === 'mois' ? 'default' : 'outline'}
              onClick={() => setViewMode('mois')}
            >
              Mois
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" size="sm" onClick={goToPrevious}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-medium capitalize">{periodTitle}</span>
            <Button variant="ghost" size="sm" onClick={goToToday}>
              Aujourd'hui
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={goToNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'semaine' ? (
          // Vue Semaine avec créneaux
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full border-collapse table-fixed min-w-[640px]">
              <thead>
                <tr>
                  <th className="p-2 sm:p-3 border bg-muted/50 w-12 sm:w-20 text-xs sm:text-sm"></th>
                  {weekDays.map((day, i) => (
                    <th key={i} className={`p-2 sm:p-3 border text-center ${isSameDay(day, new Date()) ? 'bg-primary/10' : 'bg-muted/50'}`}>
                      <div className="font-semibold text-xs sm:text-base">{JOURS[i]}</div>
                      <div className="text-[10px] sm:text-sm text-muted-foreground">
                        {format(day, 'd', { locale: fr })}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CRENEAUX.map((creneau) => (
                  <tr key={creneau}>
                    <td className={`p-1 sm:p-3 border text-center font-semibold text-[10px] sm:text-sm ${CRENEAU_COLORS[creneau]}`}>
                      {creneau}
                    </td>
                    {weekDays.map((day, i) => {
                      const daySeances = getSeancesForDayAndCreneau(day, creneau);
                      return (
                        <td
                          key={i}
                          className={`p-1 sm:p-2 border h-12 sm:h-16 align-top ${isSameDay(day, new Date()) ? 'bg-primary/5' : ''} ${isTutor ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
                          onClick={() => isTutor && openFormWithPreset(day, creneau)}
                        >
                          {daySeances.map((seance) => {
                            const Icon = TYPE_ICONS[seance.type as keyof typeof TYPE_ICONS];
                            // Une séance est partagée (Tréunion) si custom_label contient "tréunion"
                            const isShared = seance.custom_label && seance.custom_label.toLowerCase().includes('tréunion');
                            const tutorStyle = getTutorColorStyle(seance.tuteur_id, seance.type, isShared);
                            const isCreator = seance.tuteur_id === user?.id;
                            const canEdit = isTutor && (isCreator || isShared);
                            const isMySeance = isCreator;
                            const canView = !canEdit && isTutor;
                            const tutorProfile = getProfile(seance.tuteur_id);
                            const tutorFirstName = tutorProfile?.display_name?.split(' ')[0] || 'Tuteur';

                            // Pour les séances "autre" (Tréunions), afficher les initiales des deux tuteurs
                            let displayName = tutorFirstName;
                            if (isShared && profiles) {
                              const otherProfile = profiles.find(p => p.user_id !== seance.tuteur_id && p.role === 'tuteur');
                              if (otherProfile) {
                                const otherFirstName = otherProfile.display_name?.split(' ')[0] || 'T';
                                displayName = `${tutorFirstName.charAt(0)} & ${otherFirstName.charAt(0)}`;
                              }
                            }

                            const tooltipText = canEdit ? 'Cliquez pour modifier' : canView ? 'Cliquez pour consulter' : '';
                            return (
                              <div
                                key={seance.id}
                                className={`p-1 sm:p-1.5 mb-1 rounded text-[10px] sm:text-sm group relative transition-all ${canEdit || canView ? 'cursor-pointer hover:ring-2 hover:ring-white/50 hover:shadow-md' : ''}`}
                                style={tutorStyle}
                                title={tooltipText}
                                onClick={(e) => (canEdit || canView) && handleSeanceClick(seance, e)}
                              >
                                <div className="flex items-center gap-0.5 sm:gap-1 justify-between">
                                  <div className="flex items-center gap-0.5 sm:gap-1 flex-1 min-w-0">
                                    {Icon && <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" title={
                                      seance.type === 'visite' ? 'Visite' :
                                      seance.type === 'suivi' ? 'Suivi' :
                                      seance.type === 'formation' ? 'Formation' :
                                      seance.type === 'evaluation' ? 'Évaluation' :
                                      'Autre'
                                    } />}
                                    <span
                                      className="hidden sm:inline truncate font-medium"
                                      title={seance.custom_label ? `Type personnalisé: ${seance.custom_label}` : ''}
                                    >
                                      {seance.custom_label ||
                                       (seance.type === 'visite' ? 'Visite' :
                                        seance.type === 'suivi' ? 'Suivi' :
                                        seance.type === 'formation' ? 'Formation' :
                                        seance.type === 'evaluation' ? 'Évaluation' :
                                        'Autre')}
                                    </span>
                                    <span className="text-[9px] sm:text-[10px] px-0.5 sm:px-1 py-0.5 bg-white/30 rounded ml-0.5 sm:ml-1 flex-shrink-0">
                                      {displayName}
                                    </span>
                                  </div>
                                  {canEdit && (
                                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openEditForm(seance, e);
                                        }}
                                        className="p-0.5 hover:bg-white/50 rounded"
                                        title="Modifier"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                      {isCreator && (
                                        <button
                                          onClick={(e) => handleDeleteSeance(seance.id, e)}
                                          className="p-0.5 hover:bg-white/50 rounded"
                                          title="Supprimer"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-xs opacity-70 mt-0.5">
                                  {seance.duree && <span className="hidden sm:inline">{seance.duree}h</span>}
                                  {seance.classe_visitee && (
                                    <span className={`px-0.5 sm:px-1 py-0.5 rounded font-bold text-[9px] sm:text-xs ${seance.classe_visitee.startsWith('6') ? 'bg-green-500/30 text-green-900' : 'bg-yellow-500/30 text-yellow-900'}`}>
                                      {seance.classe_visitee}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Vue Mois
          <div className="grid grid-cols-7 gap-1">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((jour) => (
              <div key={jour} className="p-2 text-center font-medium text-sm bg-muted/50">
                {jour}
              </div>
            ))}
            {monthDays.map((day, i) => {
              const daySeances = getSeancesForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={i}
                  className={`p-1 border min-h-[80px] ${!isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : ''} ${isToday ? 'bg-primary/10 border-primary' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  {daySeances.slice(0, 2).map((seance) => {
                    const isShared = seance.shared_with_peers === true;
                    const tutorStyle = getTutorColorStyle(seance.tuteur_id, seance.type, isShared);
                    const isCreator = seance.tuteur_id === user?.id;
                    const canEdit = isTutor && (isCreator || isShared);
                    const isMySeance = isCreator;
                    const canView = !canEdit && isTutor;
                    const tutorProfile = getProfile(seance.tuteur_id);
                    const tutorFirstName = tutorProfile?.display_name?.split(' ')[0] || 'Tuteur';

                    // Pour les séances partagées, afficher les initiales des deux tuteurs
                    let displayInitials = tutorFirstName.charAt(0);
                    if (isShared && profiles) {
                      const otherProfile = profiles.find(p => p.user_id !== seance.tuteur_id && p.role === 'tuteur');
                      if (otherProfile) {
                        const otherFirstName = otherProfile.display_name?.split(' ')[0] || 'T';
                        displayInitials = `${tutorFirstName.charAt(0)} & ${otherFirstName.charAt(0)}`;
                      }
                    }

                    return (
                      <div
                        key={seance.id}
                        className={`p-0.5 mb-0.5 rounded text-[10px] group flex items-center gap-0.5 relative transition-all ${canEdit || canView ? 'cursor-pointer hover:ring-1 hover:ring-white/50 hover:shadow' : ''}`}
                        style={tutorStyle}
                        title={canEdit ? 'Cliquez pour modifier' : canView ? 'Cliquez pour consulter' : `${seance.creneau || seance.heure}`}
                        onClick={(e) => (canEdit || canView) && handleSeanceClick(seance, e)}
                      >
                        <span className="flex-1 min-w-0 truncate">
                          {seance.classe_visitee && (
                            <span className={`inline-block px-1 rounded mr-1 font-bold ${seance.classe_visitee.startsWith('6') ? 'bg-green-500/30 text-green-900' : 'bg-yellow-500/30 text-yellow-900'}`}>
                              {seance.classe_visitee}
                            </span>
                          )}
                          {seance.creneau || seance.heure}
                          {' • ' + displayInitials}
                        </span>
                        {canEdit && (
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditForm(seance, e);
                              }}
                              className="p-0.5 hover:bg-white/50 rounded"
                              title="Modifier"
                            >
                              <Pencil className="w-2.5 h-2.5" />
                            </button>
                            {isCreator && (
                              <button
                                onClick={(e) => handleDeleteSeance(seance.id, e)}
                                className="p-0.5 hover:bg-white/50 rounded"
                                title="Supprimer"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {daySeances.length > 2 && (
                    <div className="text-[10px] text-muted-foreground">
                      +{daySeances.length - 2}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Légende */}
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Visite <span className="hidden sm:inline text-muted-foreground">(bordure pleine)</span></span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Suivi <span className="hidden sm:inline text-muted-foreground">(bordure pointillée)</span></span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 rounded bg-orange-100 border border-orange-300"></div>
              <span className="hidden sm:inline">Matin (M1-M4)</span>
              <span className="sm:hidden">M1-M4</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 rounded bg-purple-100 border border-purple-300"></div>
              <span className="hidden sm:inline">Après-midi (S1-S4)</span>
              <span className="sm:hidden">S1-S4</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
              <span className="hidden sm:inline">Couleurs = tuteurs</span>
              <span className="sm:hidden">🎨 = tuteurs</span>
            </div>
          </div>
          {isTutor && (
            <div className="text-[10px] sm:text-xs text-muted-foreground bg-muted/50 p-2 rounded border border-dashed">
              💡 <strong>Astuce :</strong> <span className="hidden sm:inline">Vos séances sont marquées "Moi" - cliquez dessus pour les <strong>modifier</strong>. Les séances des autres tuteurs s'ouvrent en <strong>consultation</strong> (lecture seule).</span>
              <span className="sm:hidden">Cliquez sur vos séances pour modifier, sur celles des autres pour consulter.</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Dialog pour créer/modifier une séance */}
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) {
          // Ne pas réinitialiser immédiatement pour permettre la soumission
          setTimeout(() => resetForm(), 100);
        }
      }}>
        <SeanceForm
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          editingSeance={editingSeance}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </Dialog>

      {/* Dialog de consultation (lecture seule) */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        {viewingSeance && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {viewingSeance.type === 'visite' ? <Eye className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                Consultation - {viewingSeance.custom_label || (viewingSeance.type === 'visite' ? 'Visite' : 'Suivi')}
              </DialogTitle>
              <DialogDescription>
                Séance de {getProfile(viewingSeance.tuteur_id)?.display_name || 'tuteur'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">{format(new Date(viewingSeance.date), 'EEEE dd MMMM yyyy', { locale: fr })}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Durée</Label>
                  <p className="font-medium">{viewingSeance.duree} heure{viewingSeance.duree > 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Horaire</Label>
                  <p className="font-medium">
                    {viewingSeance.creneau ? (
                      <Badge className={viewingSeance.creneau.startsWith('M') ? 'bg-orange-500' : 'bg-purple-500'}>
                        {viewingSeance.creneau}
                      </Badge>
                    ) : viewingSeance.heure || 'Non précisé'}
                  </p>
                </div>
                {viewingSeance.classe_visitee && (
                  <div>
                    <Label className="text-muted-foreground">Classe</Label>
                    <p className="font-medium">
                      <Badge className={viewingSeance.classe_visitee.startsWith('6') ? 'bg-green-500' : 'bg-yellow-500'}>
                        {viewingSeance.classe_visitee}
                      </Badge>
                    </p>
                  </div>
                )}
              </div>

              {viewingSeance.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes et observations</Label>
                  <div className="mt-2 p-3 bg-muted/50 rounded border">
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: viewingSeance.notes }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                <span>Créée le {format(new Date(viewingSeance.createdAt), 'dd/MM/yyyy à HH:mm')}</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </Card>
  );
}
