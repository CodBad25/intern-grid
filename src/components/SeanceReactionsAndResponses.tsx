import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, ThumbsUp, ThumbsDown, Smile, Laugh, Frown, Reply, Share2, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/RichTextEditor';
import { RichTextViewer } from '@/components/RichTextViewer';
import { TutorName } from '@/components/TutorName';
import { ReactionSystem } from '@/components/ReactionSystem';
import { useSeanceReactions } from '@/hooks/useSeanceReactions';
import { useSeanceResponses } from '@/hooks/useSeanceResponses';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/context/AuthContext';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface SeanceReactionsAndResponsesProps {
  seanceId: string;
  seanceAuthorId: string;
}

export function SeanceReactionsAndResponses({ seanceId, seanceAuthorId }: SeanceReactionsAndResponsesProps) {
  const { user } = useAuth();
  const { getProfile } = useProfiles();
  const [showResponses, setShowResponses] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [sharedWithPeers, setSharedWithPeers] = useState(false);
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const {
    reactions,
    fetchReactions,
    addReaction,
    removeReaction,
    getReactionsForSeance
  } = useSeanceReactions();

  const {
    responses,
    fetchResponses,
    addResponse,
    updateResponse,
    deleteResponse,
    getResponsesForSeance
  } = useSeanceResponses();

  useEffect(() => {
    fetchReactions(seanceId);
    fetchResponses(seanceId);
  }, [seanceId]);

  const seanceReactions = getReactionsForSeance(seanceId);
  const seanceResponses = getResponsesForSeance(seanceId);

  const handleAddReaction = async (type: string) => {
    try {
      await addReaction({ type, seance_id: seanceId });
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la réaction');
    }
  };

  const handleRemoveReaction = async (reactionId: string) => {
    try {
      await removeReaction(reactionId);
    } catch (error) {
      toast.error('Erreur lors de la suppression de la réaction');
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !user) return;

    try {
      await addResponse({
        seance_id: seanceId,
        content: replyContent,
        shared_with_peers: sharedWithPeers
      });

      setReplyContent('');
      setShowReplyForm(false);
      setSharedWithPeers(false);
      toast.success('Réponse ajoutée avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la réponse');
    }
  };

  const handleEditResponse = (response: any) => {
    setEditingResponseId(response.id);
    setEditContent(response.content);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || !editingResponseId) return;

    try {
      await updateResponse(editingResponseId, { content: editContent });
      setEditingResponseId(null);
      setEditContent('');
      toast.success('Réponse modifiée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDeleteResponse = async (responseId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette réponse ?')) return;

    try {
      await deleteResponse(responseId);
      toast.success('Réponse supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const canModifyResponse = (response: any) => {
    return user?.role === 'admin' || response.user_id === user?.id;
  };

  const canReply = () => {
    return user?.role === 'tuteur' || user?.role === 'admin';
  };

  const getUserProfile = (userId: string) => {
    return getProfile(userId);
  };

  return (
    <div className="mt-4 space-y-3">
      {/* Système de réactions */}
      <div className="flex items-center gap-2">
        <ReactionSystem
          targetId={seanceId}
          reactions={seanceReactions.map(r => ({
            id: r.id,
            type: r.type as any,
            userId: r.user_id,
            userName: getUserProfile(r.user_id)?.display_name || 'Utilisateur',
            targetId: r.seance_id,
            targetType: 'seance' as any,
            createdAt: r.created_at
          }))}
          onAddReaction={handleAddReaction}
          onRemoveReaction={handleRemoveReaction}
          size="sm"
        />
        
        {canReply() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Reply className="w-4 h-4 mr-1" />
            Répondre
          </Button>
        )}
      </div>

      {/* Formulaire de réponse */}
      {showReplyForm && (
        <Card className="border-dashed">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <RichTextEditor
                value={replyContent}
                onValueChange={setReplyContent}
                placeholder="Écrivez votre réponse..."
                rows={3}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="share-reply"
                    checked={sharedWithPeers}
                    onCheckedChange={setSharedWithPeers}
                  />
                  <Label htmlFor="share-reply" className="text-sm">
                    Partager avec les autres tuteurs
                  </Label>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent('');
                      setSharedWithPeers(false);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmitReply}
                    disabled={!replyContent.trim()}
                  >
                    Publier
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des réponses */}
      {seanceResponses.length > 0 && (
        <Collapsible open={showResponses} onOpenChange={setShowResponses}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <MessageSquare className="w-4 h-4 mr-2" />
              {seanceResponses.length} réponse{seanceResponses.length > 1 ? 's' : ''}
              <span className="ml-auto">
                {showResponses ? '−' : '+'}
              </span>
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-3 mt-3">
            {seanceResponses.map((response) => {
              const profile = getUserProfile(response.user_id);
              const isEditing = editingResponseId === response.id;
              
              return (
                <Card key={response.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TutorName
                          name={profile?.display_name || 'Utilisateur inconnu'}
                          userId={response.user_id}
                          color={profile?.color || undefined}
                          avatarUrl={profile?.avatar_url}
                          variant="inline"
                          size="sm"
                        />
                        {response.shared_with_peers && (
                          <Badge variant="secondary" className="text-xs">
                            <Share2 className="w-3 h-3 mr-1" />
                            Partagé
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(response.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                        </span>
                      </div>
                      
                      {canModifyResponse(response) && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditResponse(response)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteResponse(response.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-2">
                        <RichTextEditor
                          value={editContent}
                          onValueChange={setEditContent}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={!editContent.trim()}
                          >
                            Sauvegarder
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingResponseId(null);
                              setEditContent('');
                            }}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <RichTextViewer html={response.content} />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}