
import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Search,
  Edit2,
  Trash2,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Users,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextAreaWithVoice } from '@/components/TextAreaWithVoice';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Evenement } from '../types';
import { format, parseISO, isAfter, isBefore, addDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from './LoadingSpinner';

const EVENEMENT_TYPES = [
  { value: 'reunion', label: 'Réunion' },
  { value: 'autre', label: 'Autre' },
] as const;

const EVENEMENT_TYPE_ICONS = {
  reunion: Users,
  autre: AlertTriangle,
};

const EVENEMENT_TYPE_COLORS = {
  reunion: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  autre: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

interface EvenementFormData {
  titre: string;
  description: string;
  date: string;
  type: Evenement['type'];
  customType?: string;
}

const defaultFormData: EvenementFormData = {
  titre: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  type: 'reunion',
};

export function Planning() {
  const { user } = useAuth();
  const { evenements, addEvenement, deleteEvenement } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<EvenementFormData>(defaultFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredEvenements = useMemo(() => {
    const today = startOfDay(new Date());
    
    return evenements.filter(evenement => {
      const matchesSearch = evenement.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           evenement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           evenement.tuteurName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || evenement.type === typeFilter;
      
      const eventDate = parseISO(evenement.date);
      let matchesDate = true;
      
      if (dateFilter === 'upcoming') {
        matchesDate = isAfter(eventDate, today) || format(eventDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      } else if (dateFilter === 'past') {
        matchesDate = isBefore(eventDate, today);
      } else if (dateFilter === 'this_week') {
        const weekEnd = addDays(today, 7);
        matchesDate = (isAfter(eventDate, today) || format(eventDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) && isBefore(eventDate, weekEnd);
      }
      
      return matchesSearch && matchesType && matchesDate;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [evenements, searchTerm, typeFilter, dateFilter]);

  const upcomingEvenements = useMemo(() => {
    const today = startOfDay(new Date());
    return evenements.filter(ev => {
      const eventDate = parseISO(ev.date);
      return isAfter(eventDate, today) || format(eventDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    }).slice(0, 3);
  }, [evenements]);

  const resetForm = () => {
    setFormData(defaultFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const typeToSend = formData.type === 'autre' && formData.customType ? 'autre' : formData.type;

      const evenementData = {
        ...formData,
        type: typeToSend,
        description: formData.type === 'autre' && formData.customType 
          ? `[${formData.customType}] ${formData.description}` 
          : formData.description,
        tuteurId: user.id,
        tuteurName: user.name,
      };

      // Remove customType from the data being sent
      const { customType, ...dataToSend } = evenementData;
      addEvenement(dataToSend as Omit<Evenement, 'id' | 'createdAt'>);
      toast.success('Événement ajouté avec succès');
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (evenement: Evenement) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      try {
        deleteEvenement(evenement.id);
        toast.success('Événement supprimé');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const canModify = (evenement: Evenement) => {
    return user?.role === 'admin' || (user?.role === 'tuteur' && evenement.tuteurId === user?.id);
  };

  const isEventUpcoming = (date: string) => {
    const today = startOfDay(new Date());
    const eventDate = parseISO(date);
    return isAfter(eventDate, today) || format(eventDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  };

  const isEventToday = (date: string) => {
    const today = new Date();
    const eventDate = parseISO(date);
    return format(eventDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  };

  const getEventTypeDisplay = (type: string) => {
    const standardType = EVENEMENT_TYPES.find(t => t.value === type);
    return standardType ? standardType.label : type;
  };

  const getEventTypeColor = (type: string) => {
    return EVENEMENT_TYPE_COLORS[type as keyof typeof EVENEMENT_TYPE_COLORS] || EVENEMENT_TYPE_COLORS.autre;
  };

  const getEventTypeIcon = (type: string) => {
    return EVENEMENT_TYPE_ICONS[type as keyof typeof EVENEMENT_TYPE_ICONS] || EVENEMENT_TYPE_ICONS.autre;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Planning et événements
          </h1>
          <p className="text-muted-foreground">
            Organisation des événements et rendez-vous
          </p>
        </div>
        
        {(user?.role === 'tuteur' || user?.role === 'admin') && (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvel événement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nouvel événement</DialogTitle>
                <DialogDescription>
                  Planifiez un nouveau rendez-vous ou événement
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="titre">Titre</Label>
                  <Input
                    id="titre"
                    value={formData.titre}
                    onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
                    placeholder="Titre de l'événement"
                    required
                  />
                </div>

                <div>
                  <Label>Type d'événement</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {EVENEMENT_TYPES.map((type) => {
                      const Icon = EVENEMENT_TYPE_ICONS[type.value as keyof typeof EVENEMENT_TYPE_ICONS];
                      return (
                        <Button
                          key={type.value}
                          type="button"
                          variant={formData.type === type.value ? 'default' : 'outline'}
                          className="h-auto py-3 flex-col gap-1"
                          onClick={() => setFormData(prev => ({ ...prev, type: type.value as Evenement['type'] }))}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-xs">{type.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                  
                  {formData.type === 'autre' && (
                    <div className="mt-3">
                      <Label htmlFor="customType">Type personnalisé</Label>
                      <Input
                        id="customType"
                        value={formData.customType || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, customType: e.target.value }))}
                        placeholder="Précisez le type d'événement"
                        required
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <TextAreaWithVoice
                    id="description"
                    value={formData.description}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                    placeholder="Décrivez l'événement, les participants, l'ordre du jour..."
                    rows={4}
                    required
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                    Créer
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Quick Overview */}
      {upcomingEvenements.length > 0 && (
        <Card className="bg-gradient-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Prochains événements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingEvenements.map((evenement) => (
                <div key={evenement.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getEventTypeColor(evenement.type)}>
                      {getEventTypeDisplay(evenement.type)}
                    </Badge>
                    {isEventToday(evenement.date) && (
                      <Badge variant="destructive">
                        Aujourd'hui
                      </Badge>
                    )}
                    <span className="font-medium">{evenement.titre}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(parseISO(evenement.date), 'dd MMM', { locale: fr })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtres
              </div>
              <ChevronDown className={cn("w-4 h-4 transition-transform", isFiltersOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Rechercher</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="search"
                    className="pl-10"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="typeFilter">Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {EVENEMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateFilter">Période</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Toutes les dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les dates</SelectItem>
                    <SelectItem value="upcoming">À venir</SelectItem>
                    <SelectItem value="this_week">Cette semaine</SelectItem>
                    <SelectItem value="past">Passés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvenements.length > 0 ? (
          filteredEvenements.map((evenement, index) => {
            const Icon = getEventTypeIcon(evenement.type);
            const isUpcoming = isEventUpcoming(evenement.date);
            const isToday = isEventToday(evenement.date);
            
            return (
              <Card key={evenement.id} className={cn(
                "hover-lift animate-fade-in",
                isToday && "ring-2 ring-primary/50 bg-primary/5"
              )} style={{ animationDelay: `${index * 0.05}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getEventTypeColor(evenement.type)}>
                              {getEventTypeDisplay(evenement.type)}
                            </Badge>
                            {isToday && (
                              <Badge variant="destructive">
                                Aujourd'hui
                              </Badge>
                            )}
                            {isUpcoming && !isToday && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                                À venir
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg">{evenement.titre}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(parseISO(evenement.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-foreground mb-3">{evenement.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Organisé par {evenement.tuteurName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Créé le {format(parseISO(evenement.createdAt), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>

                    {canModify(evenement) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleDelete(evenement)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <EmptyState
            title="Aucun événement trouvé"
            description={searchTerm || typeFilter !== 'all' || dateFilter !== 'all'
              ? "Aucun événement ne correspond à vos critères de recherche" 
              : "Commencez par planifier votre premier événement"
            }
            icon={Calendar}
            action={(user?.role === 'tuteur' || user?.role === 'admin') && !searchTerm && typeFilter === 'all' && dateFilter === 'all' ? {
              label: "Créer un événement",
              onClick: () => { resetForm(); setIsFormOpen(true); }
            } : undefined}
          />
        )}
      </div>
    </div>
  );
}
