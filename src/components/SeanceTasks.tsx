import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ListTodo } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  completed_at: string | null;
}

interface SeanceTasksProps {
  sessionId: string;
}

export function SeanceTasks({ sessionId }: SeanceTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('objectives')
          .select('id, title, description, isCompleted, completed_at')
          .eq('session_id', sessionId)
          .eq('type', 'tache')
          .order('created_at', { ascending: true });

        if (error) throw error;
        setTasks(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [sessionId]);

  if (isLoading || tasks.length === 0) {
    return null;
  }

  const completedCount = tasks.filter(t => t.isCompleted).length;

  return (
    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2 mb-2">
        <ListTodo className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
          Tâches assignées
        </span>
        <Badge variant="secondary" className="text-xs">
          {completedCount}/{tasks.length}
        </Badge>
      </div>
      <div className="space-y-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-start gap-2 text-sm ${
              task.isCompleted
                ? 'text-green-700 dark:text-green-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {task.isCompleted ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
            ) : (
              <Circle className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
            )}
            <span className={task.isCompleted ? 'line-through opacity-70' : ''}>
              {task.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
