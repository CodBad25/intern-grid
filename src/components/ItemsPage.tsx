import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useItems } from '@/hooks/useItems';
import { useAuth } from '@/context/AuthContext';
import { Trash2, Edit2, Plus, Eye, CheckCircle, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ObjectiveObservations } from './ObjectiveObservations';

export function ItemsPage() {
  const { user } = useAuth();
  const {
    items,
    isLoading,
    createItem,
    markItemAsCompleted,
    markItemAsNotCompleted,
    validateItem,
    unvalidateItem,
    updateItem,
    deleteItem,
    updateValidatedDate,
    updateCompletedDate
  } = useItems();

  // États pour le formulaire de création
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemType, setNewItemType] = useState<'tache' | 'objectif'>('objectif');
  const [isCreating, setIsCreating] = useState(false);

  // États pour l'édition
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');

  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'tache' | 'objectif'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'validated' | 'pending'>('all');

  // États pour l'édition des dates
  const [editingDateItemId, setEditingDateItemId] = useState<string | null>(null);
  const [editingDateType, setEditingDateType] = useState<'completed' | 'validated' | null>(null);
  const [editingDateValue, setEditingDateValue] = useState('');

  // Vérifier si l'utilisateur est tuteur ou admin
  const isTutor = user?.role === 'tuteur' || user?.role === 'admin';

  // Filtrer les items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Filtre par recherche
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filtre par type
      const matchesType = filterType === 'all' || item.type === filterType;

      // Filtre par statut
      let matchesStatus = true;
      if (filterStatus === 'completed') {
        matchesStatus = item.isCompleted && !item.isValidated;
      } else if (filterStatus === 'validated') {
        matchesStatus = item.isValidated;
      } else if (filterStatus === 'pending') {
        matchesStatus = !item.isCompleted && !item.isValidated;
      }

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [items, searchQuery, filterType, filterStatus]);

  const handleCreateItem = async () => {
    if (!newItemTitle.trim()) {
      alert('Le titre est obligatoire');
      return;
    }

    setIsCreating(true);
    try {
      await createItem(newItemTitle, newItemDescription, newItemType);
      setNewItemTitle('');
      setNewItemDescription('');
      setNewItemType('objectif');
    } catch (error) {
      console.error('Erreur lors de la création de l\'élément:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartEdit = (item: any) => {
    setEditingItemId(item.id);
    setEditingTitle(item.title);
    setEditingDescription(item.description || '');
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingTitle('');
    setEditingDescription('');
  };

  const handleSaveEdit = async (itemId: string) => {
    try {
      await updateItem(itemId, editingTitle, editingDescription);
      setEditingItemId(null);
      setEditingTitle('');
      setEditingDescription('');
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    }
  };

  const handleDelete = async (itemId: string, itemTitle: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${itemTitle}" ?`)) {
      try {
        await deleteItem(itemId);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleToggleCompleted = async (item: any) => {
    try {
      if (item.isCompleted) {
        await markItemAsNotCompleted(item.id);
      } else {
        await markItemAsCompleted(item.id);
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const handleToggleValidated = async (item: any) => {
    try {
      if (item.isValidated) {
        await unvalidateItem(item.id);
      } else {
        await validateItem(item.id);
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    }
  };

  const handleStartEditDate = (itemId: string, dateType: 'completed' | 'validated', currentDate: string) => {
    setEditingDateItemId(itemId);
    setEditingDateType(dateType);
    const date = new Date(currentDate);
    setEditingDateValue(date.toISOString().split('T')[0]);
  };

  const handleSaveDate = async () => {
    if (!editingDateItemId || !editingDateType || !editingDateValue) return;

    try {
      if (editingDateType === 'completed') {
        await updateCompletedDate(editingDateItemId, editingDateValue);
      } else {
        await updateValidatedDate(editingDateItemId, editingDateValue);
      }
      setEditingDateItemId(null);
      setEditingDateType(null);
      setEditingDateValue('');
    } catch (error) {
      console.error('Erreur lors de la modification de la date:', error);
    }
  };

  const handleCancelEditDate = () => {
    setEditingDateItemId(null);
    setEditingDateType(null);
    setEditingDateValue('');
  };

  // Statistiques
  const stats = useMemo(() => {
    const total = items.length;
    const taches = items.filter(i => i.type === 'tache').length;
    const objectifs = items.filter(i => i.type === 'objectif').length;
    const completed = items.filter(i => i.isCompleted).length;
    const validated = items.filter(i => i.isValidated).length;
    const pending = items.filter(i => !i.isCompleted && !i.isValidated).length;

    return { total, taches, objectifs, completed, validated, pending };
  }, [items]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tâches & Objectifs</h1>
        <p className="text-muted-foreground">
          Gérez les tâches quotidiennes et les objectifs de stage
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tâches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.taches}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Objectifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.objectifs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Réalisés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Validés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.validated}</div>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire de création (visible uniquement pour les tuteurs/admins) */}
      {isTutor && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Créer un nouvel élément
            </CardTitle>
            <CardDescription>
              Ajoutez une tâche ou un objectif pour le stagiaire
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Type</label>
                <Select value={newItemType} onValueChange={(value: 'tache' | 'objectif') => setNewItemType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tache">Tâche</SelectItem>
                    <SelectItem value="objectif">Objectif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-[2]">
                <label className="block text-sm font-medium mb-2">Titre *</label>
                <Input
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="Ex: Mettre à jour la base de données"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description (optionnel)</label>
              <Textarea
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="Détails supplémentaires..."
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCreateItem} disabled={isCreating}>
                <Plus className="w-4 h-4 mr-2" />
                Créer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres et recherche */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="tache">Tâches</SelectItem>
                  <SelectItem value="objectif">Objectifs</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="completed">Réalisés</SelectItem>
                  <SelectItem value="validated">Validés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des items */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                ? 'Aucun élément ne correspond à vos critères de recherche'
                : 'Aucun élément pour le moment'}
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className={`
              ${item.isValidated ? 'border-green-500 bg-green-50/50' : ''}
              ${item.isCompleted && !item.isValidated ? 'border-orange-500 bg-orange-50/50' : ''}
            `}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {editingItemId === item.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          placeholder="Titre"
                          className="font-semibold"
                        />
                        <Textarea
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          placeholder="Description"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSaveEdit(item.id)}>Enregistrer</Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>Annuler</Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${item.type === 'tache' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {item.type === 'tache' ? 'Tâche' : 'Objectif'}
                          </span>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </div>
                        {item.description && (
                          <CardDescription className="mt-2">{item.description}</CardDescription>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    {isTutor && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => handleStartEdit(item)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id, item.title)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <span>Créé par {item.creator?.display_name || 'Inconnu'}</span>
                  <span>•</span>
                  <span>{format(new Date(item.created_at), 'dd/MM/yyyy', { locale: fr })}</span>
                  {item.isCompleted && (
                    <>
                      <span>•</span>
                      {editingDateItemId === item.id && editingDateType === 'completed' ? (
                        <span className="flex items-center gap-1">
                          <input
                            type="date"
                            value={editingDateValue}
                            onChange={(e) => setEditingDateValue(e.target.value)}
                            className="text-xs border rounded px-1 py-0.5"
                          />
                          <button onClick={handleSaveDate} className="text-xs bg-green-500 text-white px-1 py-0.5 rounded">✓</button>
                          <button onClick={handleCancelEditDate} className="text-xs bg-red-500 text-white px-1 py-0.5 rounded">✗</button>
                        </span>
                      ) : (
                        <span
                          className={`text-orange-600 ${isTutor ? 'cursor-pointer hover:underline' : ''}`}
                          onClick={() => isTutor && handleStartEditDate(item.id, 'completed', item.completed_at!)}
                          title={isTutor ? 'Cliquer pour modifier la date' : ''}
                        >
                          Réalisé le {format(new Date(item.completed_at!), 'dd/MM/yyyy', { locale: fr })}
                        </span>
                      )}
                    </>
                  )}
                  {item.isValidated && (
                    <>
                      <span>•</span>
                      {editingDateItemId === item.id && editingDateType === 'validated' ? (
                        <span className="flex items-center gap-1">
                          <input
                            type="date"
                            value={editingDateValue}
                            onChange={(e) => setEditingDateValue(e.target.value)}
                            className="text-xs border rounded px-1 py-0.5"
                          />
                          <button onClick={handleSaveDate} className="text-xs bg-green-500 text-white px-1 py-0.5 rounded">✓</button>
                          <button onClick={handleCancelEditDate} className="text-xs bg-red-500 text-white px-1 py-0.5 rounded">✗</button>
                        </span>
                      ) : (
                        <span
                          className={`text-green-600 ${isTutor ? 'cursor-pointer hover:underline' : ''}`}
                          onClick={() => isTutor && handleStartEditDate(item.id, 'validated', item.validated_at!)}
                          title={isTutor ? 'Cliquer pour modifier la date' : ''}
                        >
                          Validé par {item.validator?.display_name || 'Inconnu'} le {format(new Date(item.validated_at!), 'dd/MM/yyyy', { locale: fr })}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant={item.isCompleted ? "default" : "outline"}
                    onClick={() => handleToggleCompleted(item)}
                    disabled={item.isValidated}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {item.isCompleted ? 'Réalisé' : 'Marquer comme réalisé'}
                  </Button>
                  {isTutor && (
                    <Button
                      size="sm"
                      variant={item.isValidated ? "default" : "outline"}
                      onClick={() => handleToggleValidated(item)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {item.isValidated ? 'Validé' : 'Valider'}
                    </Button>
                  )}
                </div>
                {item.type === 'objectif' && <ObjectiveObservations objectiveId={item.id} objectiveTitle={item.title} />}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
