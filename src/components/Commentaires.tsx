import React, { useState, useMemo, useEffect } from 'react';
import { 
  MessageSquare, 
  MessageCircle,
  Plus, 
  Search,
  Edit2,
  Trash2,
  Reply,
  Share2,
  Filter,
  ChevronDown,
  MoreHorizontal,
  AlertCircle,
  RefreshCcw,
  Check
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
import { Switch } from '@/components/ui/switch';
import { useCommentaires } from '../hooks/useCommentaires';
import { Commentaire as SupabaseCommentaire, Reponse as SupabaseReponse, Reaction as SupabaseReaction } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotificationSender } from '../hooks/useNotificationSender';
import { ReactionSystem, ReactionType } from './ReactionSystem';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from './LoadingSpinner';

interface CommentaireFormData {
  type: 'remarque' | 'question';
  content: string;
}

interface ReponseFormData {
  content: string;
  shared_with_peers: boolean;
}

const defaultCommentaireFormData: CommentaireFormData = {
  type: 'question',
  content: '',
};

const defaultReponseFormData: ReponseFormData = {
  content: '',
  shared_with_peers: true,
};

export function Commentaires() {
  const { user } = useAuth();
  const { 
    commentaires, 
    reponses, 
    addCommentaire, 
    updateCommentaire, 
    deleteCommentaire,
    addReponse,
    updateReponse,
    deleteReponse,
    addReaction,
    removeReaction,
    getReactionsForTarget,
    fetchCommentaires,
    fetchReponses
  } = useCommentaires();
  const { sendCommentNotification, sendResponseNotification } = useNotificationSender();
  
  const [isCommentFormOpen, setIsCommentFormOpen] = useState(false);
  const [commentFormData, setCommentFormData] = useState<CommentaireFormData>(defaultCommentaireFormData);
  const [editingComment, setEditingComment] = useState<SupabaseCommentaire | null>(null);
  const [editingContent, setEditingContent] = useState('');
  
  const [editingReponse, setEditingReponse] = useState<SupabaseReponse | null>(null);
  const [editingReponseContent, setEditingReponseContent] = useState('');
  
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyFormData, setReplyFormData] = useState<ReponseFormData>(defaultReponseFormData);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les données au montage du composant
  useEffect(() => {
    fetchCommentaires();
    fetchReponses();
  }, [fetchCommentaires, fetchReponses]);

  const commentairesWithReponses = useMemo(() => {
    return commentaires.map(commentaire => ({
      ...commentaire,
      reponses: reponses.filter(reponse => reponse.commentaireId === commentaire.id)
    }));
  }, [commentaires, reponses]);

  const filteredCommentaires = useMemo(() => {
    return commentairesWithReponses.filter(commentaire => {
      const content = (commentaire.content || '').toLowerCase();
      const displayName = (commentaire.tuteurName || '').toLowerCase();
      const matchesSearch = content.includes(searchTerm.toLowerCase()) ||
                            displayName.includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || commentaire.type === typeFilter;
      const hasReponses = commentaire.reponses.length > 0;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'answered' && hasReponses) ||
                           (statusFilter === 'unanswered' && !hasReponses);
      return matchesSearch && matchesType && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [commentairesWithReponses, searchTerm, typeFilter, statusFilter]);

  const resetCommentForm = () => {
    setCommentFormData(defaultCommentaireFormData);
    setEditingComment(null);
  };

  const resetReplyForm = () => {
    setReplyFormData(defaultReponseFormData);
    setReplyingTo(null);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      addCommentaire({ ...commentFormData, tuteurId: user.id, tuteurName: user.name });
      sendCommentNotification(commentFormData.type);
      toast.success(commentFormData.type === 'question' ? 'Question ajoutée' : 'Remarque ajoutée');
      setIsCommentFormOpen(false);
      resetCommentForm();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyingTo) return;

    setIsLoading(true);
    try {
      addReponse({
        ...replyFormData,
        commentaireId: replyingTo,
        tuteurId: user.id,
        tuteurName: user.name,
        sharedWithPeers: replyFormData.shared_with_peers,
      });
      sendResponseNotification(replyingTo, replyFormData.shared_with_peers);
      toast.success('Réponse ajoutée');
      resetReplyForm();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComment = (commentaire: SupabaseCommentaire) => {
    setEditingComment(commentaire);
    setEditingContent(commentaire.content);
  };

  const handleSaveEdit = () => {
    if (!editingComment) return;

    try {
      updateCommentaire(editingComment.id, editingContent);
      toast.success('Commentaire modifié');
      setEditingComment(null);
      setEditingContent('');
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleEditReponse = (reponse: SupabaseReponse) => {
    setEditingReponse(reponse);
    setEditingReponseContent(reponse.content);
  };

  const handleSaveEditReponse = () => {
    if (!editingReponse) return;

    try {
      updateReponse(editingReponse.id, { content: editingReponseContent });
      toast.success('Réponse modifiée');
      setEditingReponse(null);
      setEditingReponseContent('');
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDeleteComment = (commentaire: SupabaseCommentaire) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      try {
        deleteCommentaire(commentaire.id);
        toast.success('Commentaire supprimé');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleDeleteReponse = (reponse: SupabaseReponse) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réponse ?')) {
      try {
        deleteReponse(reponse.id);
        toast.success('Réponse supprimée');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const canModifyComment = (commentaire: SupabaseCommentaire) => {
    return user?.role === 'admin' || commentaire.tuteurId === user?.id;
  };

  const canModifyReponse = (reponse: SupabaseReponse) => {
    return user?.role === 'admin' || reponse.tuteurId === user?.id;
  };

  const canReply = () => {
    return user?.role === 'tuteur' || user?.role === 'admin';
  };

  const handleAddReaction = (targetId: string, targetType: 'comment' | 'response', type: ReactionType) => {
    if (!user) return;
    
    addReaction({
      type,
      targetId: targetId,
      targetType: targetType,
      userId: user.id,
      userName: user.name,
    });
  };

  const handleRemoveReaction = (reactionId: string) => {
    removeReaction(reactionId);
  };

  const getCommentIcon = (type: SupabaseCommentaire['type']) => {
    return type === 'question' ? AlertCircle : MessageCircle;
  };

  const getCommentColor = (type: SupabaseCommentaire['type']) => {
    return type === 'question' 
      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Questions et remarques
          </h1>
          <p className="text-muted-foreground">
            Échanges et discussions sur le suivi
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={isCommentFormOpen} onOpenChange={setIsCommentFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetCommentForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau commentaire
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nouveau commentaire</DialogTitle>
                <DialogDescription>
                  Ajoutez une remarque ou posez une question
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant={commentFormData.type === 'remarque' ? 'default' : 'outline'}
                      onClick={() => setCommentFormData(prev => ({ ...prev, type: 'remarque' }))}
                      className="flex-1"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Remarque
                    </Button>
                    <Button
                      type="button"
                      variant={commentFormData.type === 'question' ? 'default' : 'outline'}
                      onClick={() => setCommentFormData(prev => ({ ...prev, type: 'question' }))}
                      className="flex-1"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Question
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">Contenu</Label>
                  <TextAreaWithVoice
                    id="content"
                    value={commentFormData.content}
                    onValueChange={(value) => setCommentFormData(prev => ({ ...prev, content: value }))}
                    placeholder={commentFormData.type === 'question' 
                      ? "Quelle est votre question ?" 
                      : "Votre remarque..."
                    }
                    rows={4}
                    required
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCommentFormOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                    Publier
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
                    <SelectItem value="remarque">Remarques</SelectItem>
                    <SelectItem value="question">Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="statusFilter">Statut</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="answered">Avec réponse</SelectItem>
                    <SelectItem value="unanswered">Sans réponse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredCommentaires.length > 0 ? (
          filteredCommentaires.map((commentaire, index) => {
            const Icon = getCommentIcon(commentaire.type);
            const isEditing = editingComment?.id === commentaire.id;
            const visibleReponses = commentaire.reponses.filter((reponse) => {
              if (!user) return false;
              if (user.role === 'admin' || user.role === 'stagiaire') return true;
              if (user.role === 'tuteur') return reponse.tuteurId === user.id || reponse.sharedWithPeers;
              return false;
            });
            
            return (
              <Card key={commentaire.id} className="hover-lift animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <CardContent className="p-6">
                  {/* Comment Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getCommentColor(commentaire.type)}>
                            {commentaire.type === 'question' ? 'Question' : 'Remarque'}
                          </Badge>
                          {commentaire.type === 'question' && commentaire.reponses.length > 0 && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200">
                              <Check className="w-3 h-3 mr-1" />
                              Répondue
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Par {commentaire.tuteurName || 'Utilisateur inconnu'} • {format(parseISO(commentaire.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                        </div>
                      </div>
                    </div>

                    {canModifyComment(commentaire) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditComment(commentaire)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteComment(commentaire)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Comment Content */}
                  {isEditing ? (
                    <div className="space-y-3">
                      <TextAreaWithVoice
                        value={editingContent}
                        onValueChange={setEditingContent}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                          Sauvegarder
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingComment(null)}>
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-foreground">{commentaire.content}</p>
                      <ReactionSystem
                        targetId={commentaire.id}
                        reactions={getReactionsForTarget(commentaire.id, 'comment').map(r => ({
                          id: r.id,
                          type: r.type as ReactionType,
                          userId: r.userId,
                          userName: r.userName || 'Utilisateur inconnu',
                          createdAt: r.createdAt
                        }))}
                        onAddReaction={(type) => handleAddReaction(commentaire.id, 'comment', type)}
                        onRemoveReaction={handleRemoveReaction}
                        disabled={!user}
                      />
                    </div>
                  )}

                  {/* Responses */}
                  {visibleReponses.length > 0 && (
                    <div className="border-l-2 border-primary/20 pl-4 space-y-3">
                       {visibleReponses.map((reponse) => {
                         const isEditingReponse = editingReponse?.id === reponse.id;
                         
                         return (
                           <div key={reponse.id} className="bg-muted/50 rounded-lg p-4">
                             <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{reponse.tuteurName || 'Utilisateur inconnu'}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(parseISO(reponse.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                                  </span>
                                  {reponse.sharedWithPeers && (
                                    <Badge variant="outline">
                                      <Share2 className="w-3 h-3 mr-1" />
                                      Partagé
                                    </Badge>
                                  )}
                                </div>
                               
                               {canModifyReponse(reponse) && (
                                 <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                     <Button variant="ghost" size="sm">
                                       <MoreHorizontal className="w-3 h-3" />
                                     </Button>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end">
                                     <DropdownMenuItem onClick={() => handleEditReponse(reponse)}>
                                       <Edit2 className="w-3 h-3 mr-2" />
                                       Modifier
                                     </DropdownMenuItem>
                                     <DropdownMenuItem 
                                       onClick={() => handleDeleteReponse(reponse)}
                                       className="text-destructive"
                                     >
                                       <Trash2 className="w-3 h-3 mr-2" />
                                       Supprimer
                                     </DropdownMenuItem>
                                   </DropdownMenuContent>
                                 </DropdownMenu>
                               )}
                             </div>
                             
                             {isEditingReponse ? (
                                <div className="space-y-3">
                                  <TextAreaWithVoice
                                    value={editingReponseContent}
                                    onValueChange={setEditingReponseContent}
                                    rows={3}
                                  />
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={handleSaveEditReponse}>
                                      Sauvegarder
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setEditingReponse(null)}>
                                      Annuler
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                 <div className="space-y-2">
                                   <p className="text-sm">{reponse.content}</p>
                                   <ReactionSystem
                                     targetId={reponse.id}
                                     reactions={getReactionsForTarget(reponse.id, 'response').map(r => ({
                                       id: r.id,
                                       type: r.type as ReactionType,
                                       userId: r.userId,
                                       userName: r.userName || 'Utilisateur inconnu',
                                       createdAt: r.createdAt
                                     }))}
                                     onAddReaction={(type) => handleAddReaction(reponse.id, 'response', type)}
                                     onRemoveReaction={handleRemoveReaction}
                                     size="sm"
                                     disabled={!user}
                                   />
                                 </div>
                              )}
                           </div>
                         );
                       })}
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingTo === commentaire.id ? (
                    <form onSubmit={handleReplySubmit} className="mt-4 border-l-2 border-primary/20 pl-4 space-y-3">
                      <TextAreaWithVoice
                        value={replyFormData.content}
                        onValueChange={(value) => setReplyFormData(prev => ({ ...prev, content: value }))}
                        placeholder="Votre réponse..."
                        rows={3}
                        required
                      />
                      
                      {user?.role === 'tuteur' && (
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="sharedWithPeers"
                            checked={replyFormData.shared_with_peers}
                            onCheckedChange={(checked) => setReplyFormData(prev => ({ ...prev, shared_with_peers: checked }))}
                          />
                          <Label htmlFor="sharedWithPeers" className="text-sm">
                            Partager avec les autres tuteurs
                          </Label>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={isLoading}>
                          {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                          Répondre
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={resetReplyForm}>
                          Annuler
                        </Button>
                      </div>
                    </form>
                  ) : (
                    canReply() && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReplyingTo(commentaire.id)}
                        className="mt-4"
                      >
                        <Reply className="w-4 h-4 mr-2" />
                        Répondre
                      </Button>
                    )
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <EmptyState
            title="Aucun commentaire trouvé"
            description={searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
              ? "Aucun commentaire ne correspond à vos critères de recherche" 
              : "Commencez la discussion en ajoutant votre premier commentaire"
            }
            icon={MessageSquare}
            action={!searchTerm && typeFilter === 'all' && statusFilter === 'all' ? {
              label: "Premier commentaire",
              onClick: () => { resetCommentForm(); setIsCommentFormOpen(true); }
            } : undefined}
          />
        )}
      </div>
    </div>
  );
}
