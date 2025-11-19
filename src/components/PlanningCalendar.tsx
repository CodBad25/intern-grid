import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Eye, UserCheck, Plus } from 'lucide-react';
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
  classeVisitee: '',
};

export function PlanningCalendar() {
  const { seances } = useData();
  const { user } = useAuth();
  const { addSeance } = useSeances();
  const { getProfile } = useProfiles();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('semaine');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<SeanceFormData>(defaultFormData);
  const [isLoading, setIsLoading] = useState(false);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData(defaultFormData);
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
      await addSeance({
        date: formData.date,
        duree: formData.duree,
        type: formData.type,
        heure: formData.horaireMode === 'ordinaire' ? formData.heure : null,
        creneau: formData.horaireMode === 'creneau' ? formData.creneau : null,
        notes: formData.notes,
        classe_visitee: formData.classeVisitee || null,
      });
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la création de la séance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isTutor = user?.role === 'tuteur' || user?.role === 'admin';

  // Fonction pour obtenir le style avec la couleur du tuteur
  const getTutorColorStyle = (tuteurId: string) => {
    const profile = getProfile(tuteurId);
    const color = profile?.color || '#6366f1';
    return {
      backgroundColor: `${color}20`,
      borderLeft: `3px solid ${color}`,
      color: color,
    };
  };

  // Filtrer les séances de type visite ou suivi
  const filteredSeances = useMemo(() => {
    return seances.filter(s => s.type === 'visite' || s.type === 'suivi');
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr>
                  <th className="p-3 border bg-muted/50 w-20"></th>
                  {weekDays.map((day, i) => (
                    <th key={i} className={`p-3 border text-center ${isSameDay(day, new Date()) ? 'bg-primary/10' : 'bg-muted/50'}`}>
                      <div className="font-semibold text-base">{JOURS[i]}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(day, 'd', { locale: fr })}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CRENEAUX.map((creneau) => (
                  <tr key={creneau}>
                    <td className={`p-3 border text-center font-semibold text-sm ${CRENEAU_COLORS[creneau]}`}>
                      {creneau}
                    </td>
                    {weekDays.map((day, i) => {
                      const daySeances = getSeancesForDayAndCreneau(day, creneau);
                      return (
                        <td
                          key={i}
                          className={`p-2 border h-16 align-top ${isSameDay(day, new Date()) ? 'bg-primary/5' : ''} ${isTutor ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
                          onClick={() => isTutor && openFormWithPreset(day, creneau)}
                        >
                          {daySeances.map((seance) => {
                            const Icon = TYPE_ICONS[seance.type as keyof typeof TYPE_ICONS];
                            const tutorStyle = getTutorColorStyle(seance.tuteur_id);
                            return (
                              <div
                                key={seance.id}
                                className="p-1.5 mb-1 rounded text-sm"
                                style={tutorStyle}
                                title={seance.notes}
                              >
                                <div className="flex items-center gap-1">
                                  {Icon && <Icon className="w-4 h-4" />}
                                  <span className="truncate font-medium">
                                    {seance.type === 'visite' ? 'Visite' : 'Suivi'}
                                  </span>
                                </div>
                                {seance.duree && (
                                  <div className="text-xs opacity-70">{seance.duree}h</div>
                                )}
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
                    const tutorStyle = getTutorColorStyle(seance.tuteur_id);
                    return (
                      <div
                        key={seance.id}
                        className="p-0.5 mb-0.5 rounded text-[10px] truncate"
                        style={tutorStyle}
                      >
                        {seance.creneau || seance.heure}
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
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>Visite</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            <span>Suivi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-100 border border-orange-300"></div>
            <span>Matin (M1-M4)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-100 border border-purple-300"></div>
            <span>Après-midi (S1-S4)</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Couleurs = tuteurs</span>
          </div>
        </div>
      </CardContent>

      {/* Dialog pour créer une séance */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SeanceForm
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          editingSeance={null}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </Dialog>
    </Card>
  );
}
