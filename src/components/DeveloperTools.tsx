
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Database, Plus, Loader2, Target } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export const DeveloperTools = () => {
  const { seances, documents, commentaires, reponses, reactions, evenements, importData } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeletingReaction, setIsDeletingReaction] = useState(false);
  const [reactionIdToDelete, setReactionIdToDelete] = useState('');

  const handleClearData = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer toutes les données de test ?')) return;
    setIsLoading(true);
    try {
      console.log('Effacement des données via RPC clear_test_data...');
      const { error } = await supabase.rpc('clear_test_data');
      if (error) {
        console.error('Erreur clear_test_data RPC:', error);
        toast.error('Erreur lors de la suppression: ' + error.message);
        return;
      }
      
      console.log('Suppression terminée. Rafraîchissement des données...');
      importData('{}'); // Clear local data
      toast.success('Toutes les données de démonstration ont été supprimées');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur inattendue lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTestData = async () => {
    setIsGenerating(true);
    try {
      console.log('Génération de données de test...');
      const { data, error } = await supabase.rpc('seed_demo_content', { 
        _user_id: 'd697b2a2-6a32-4e06-bfc6-ff74e36f6784' // Tuteur Fictif
      });
      
      if (error) {
        console.error('Erreur génération RPC:', error);
        throw error;
      }
      
      // We can't easily refresh data from Supabase here, so we'll just notify the user
      toast.success('Données de test générées pour Tuteur Fictif. Veuillez rafraîchir la page.');
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      toast.error('Erreur lors de la génération des données');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteReaction = async () => {
    if (!reactionIdToDelete.trim()) {
      toast.error('Veuillez saisir un ID de réaction');
      return;
    }

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la réaction ${reactionIdToDelete} ?`)) return;

    setIsDeletingReaction(true);
    try {
      console.log('Suppression de la réaction:', reactionIdToDelete);
      const { error } = await supabase.rpc('delete_reaction_admin', { 
        _reaction_id: reactionIdToDelete 
      });
      
      if (error) {
        console.error('Erreur suppression réaction:', error);
        toast.error('Erreur lors de la suppression: ' + error.message);
        return;
      }
      
      // We can't easily refresh data from Supabase here, so we'll just notify the user
      toast.success('Réaction supprimée avec succès. Veuillez rafraîchir la page.');
      setReactionIdToDelete('');
    } catch (error) {
      console.error('Erreur lors de la suppression de réaction:', error);
      toast.error('Erreur lors de la suppression de la réaction');
    } finally {
      setIsDeletingReaction(false);
    }
  };

  const totalData = seances.length + documents.length + commentaires.length + reponses.length + reactions.length + evenements.length;

  return (
    <Card className="border-dashed border-orange-200 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-orange-600" />
          Outils de Développement
        </CardTitle>
        <CardDescription>
          Outils pour faciliter les tests et le développement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistiques des données */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center p-2 sm:p-3 bg-white rounded-lg border">
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{seances.length}</p>
            <p className="text-xs text-muted-foreground">Séances</p>
          </div>
          <div className="text-center p-2 sm:p-3 bg-white rounded-lg border">
            <p className="text-xl sm:text-2xl font-bold text-green-600">{documents.length}</p>
            <p className="text-xs text-muted-foreground">Documents</p>
          </div>
          <div className="text-center p-2 sm:p-3 bg-white rounded-lg border">
            <p className="text-xl sm:text-2xl font-bold text-purple-600">{commentaires.length}</p>
            <p className="text-xs text-muted-foreground">Commentaires</p>
          </div>
        </div>

        {/* Statistiques supplémentaires */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center p-2 sm:p-3 bg-white rounded-lg border">
            <p className="text-xl sm:text-2xl font-bold text-indigo-600">{reponses.length}</p>
            <p className="text-xs text-muted-foreground">Réponses</p>
          </div>
          <div className="text-center p-2 sm:p-3 bg-white rounded-lg border">
            <p className="text-xl sm:text-2xl font-bold text-pink-600">{reactions.length}</p>
            <p className="text-xs text-muted-foreground">Réactions</p>
          </div>
          <div className="text-center p-2 sm:p-3 bg-white rounded-lg border">
            <p className="text-xl sm:text-2xl font-bold text-teal-600">{evenements.length}</p>
            <p className="text-xs text-muted-foreground">Événements</p>
          </div>
        </div>

        {/* Outil de suppression de réaction spécifique */}
        {reactions.length > 0 && (
          <div className="space-y-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <Label htmlFor="reaction-id" className="text-sm font-medium text-red-700">
              Supprimer une réaction par ID (Admin)
            </Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="reaction-id"
                placeholder="ID de la réaction (UUID)"
                value={reactionIdToDelete}
                onChange={(e) => setReactionIdToDelete(e.target.value)}
                className="flex-1 min-w-0"
              />
              <Button 
                onClick={handleDeleteReaction}
                disabled={isDeletingReaction || !reactionIdToDelete.trim()}
                variant="destructive"
                size="sm"
                className="shrink-0 w-full sm:w-auto"
              >
                {isDeletingReaction ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Supprimer</span>
                    <span className="sm:hidden">Suppr.</span>
                  </>
                )}
              </Button>
            </div>
            {reactions.length > 0 && (
              <div className="text-xs text-muted-foreground break-all">
                IDs des réactions existantes: {reactions.slice(0, 3).map(r => r.id).join(', ')}
                {reactions.length > 3 && ` ... et ${reactions.length - 3} autres`}
              </div>
            )}
          </div>
        )}

        {/* Actions de test */}
        <div className="space-y-2">
          <Button 
            onClick={handleGenerateTestData}
            disabled={isGenerating}
            className="w-full"
            variant="outline"
            size="sm"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            <span className="truncate">Générer des données test pour "Tuteur Fictif"</span>
          </Button>
          
          <Button 
            onClick={handleClearData} 
            disabled={isLoading}
            className="w-full"
            variant="destructive"
            size="sm"
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
            <span className="truncate">Effacer toutes les données de test ({totalData} items)</span>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Ces outils sont uniquement visibles en développement
        </p>
      </CardContent>
    </Card>
  );
};
