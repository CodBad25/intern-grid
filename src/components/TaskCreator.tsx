import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, ListTodo } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface NewTask {
  title: string;
  description: string;
}

interface TaskCreatorProps {
  sessionId?: string;
  onTasksCreated?: () => void;
}

export function TaskCreator({ sessionId, onTasksCreated }: TaskCreatorProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<NewTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    setTasks(prev => [...prev, {
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim()
    }]);
    setNewTaskTitle('');
    setNewTaskDescription('');
  };

  const handleRemoveTask = (index: number) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateTasks = async () => {
    if (!user || tasks.length === 0) return;

    setIsCreating(true);
    try {
      const tasksToCreate = tasks.map(task => ({
        title: task.title,
        description: task.description || null,
        session_id: sessionId || null,
        created_by: user.id,
        type: 'tache' as const,
        isCompleted: false,
        isValidated: false
      }));

      const { error } = await supabase
        .from('objectives')
        .insert(tasksToCreate);

      if (error) throw error;

      toast.success(`${tasks.length} tâche(s) créée(s)`);
      setTasks([]);
      onTasksCreated?.();
    } catch (error) {
      console.error('Erreur lors de la création des tâches:', error);
      toast.error('Erreur lors de la création des tâches');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ListTodo className="w-4 h-4 text-blue-500" />
        <Label className="font-medium">Tâches à fixer</Label>
      </div>

      {/* Liste des tâches ajoutées */}
      {tasks.length > 0 && (
        <div className="space-y-2 p-2 border rounded-lg bg-muted/20">
          {tasks.map((task, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveTask(index)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      <div className="space-y-2 p-3 border rounded-lg bg-muted/10">
        <Input
          placeholder="Titre de la tâche..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddTask();
            }
          }}
        />
        <Textarea
          placeholder="Description (optionnelle)..."
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          rows={2}
          className="text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddTask}
          disabled={!newTaskTitle.trim()}
          className="w-full"
        >
          <Plus className="w-3 h-3 mr-1" />
          Ajouter à la liste
        </Button>
      </div>

      {/* Bouton de création */}
      {tasks.length > 0 && (
        <Button
          type="button"
          size="sm"
          onClick={handleCreateTasks}
          disabled={isCreating}
          className="w-full"
        >
          <ListTodo className="w-4 h-4 mr-2" />
          {isCreating ? 'Création...' : `Créer ${tasks.length} tâche(s)`}
        </Button>
      )}

      {tasks.length === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Ajoutez des tâches à assigner au stagiaire suite à cette visite
        </p>
      )}
    </div>
  );
}
