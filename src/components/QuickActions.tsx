import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Plus 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Calendar,
      label: 'Nouvelle séance',
      description: 'Enregistrer une séance',
      onClick: () => navigate('/seances'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: FileText,
      label: 'Ajouter document',
      description: 'Importer un fichier',
      onClick: () => navigate('/documents'),
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: MessageSquare,
      label: 'Poser question',
      description: 'Nouvelle question',
      onClick: () => navigate('/commentaires'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      icon: BarChart3,
      label: 'Statistiques',
      description: 'Voir les données',
      onClick: () => navigate('/planning'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="w-5 h-5 text-primary" />
          Actions rapides
        </CardTitle>
        <CardDescription>
          Accès direct aux fonctionnalités principales
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              onClick={action.onClick}
              className="h-auto py-4 px-3 flex-col gap-2 hover:shadow-md transition-all duration-200"
            >
              <div className={`w-10 h-10 rounded-full ${action.bgColor} flex items-center justify-center`}>
                <action.icon className={`w-5 h-5 ${action.color}`} />
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};