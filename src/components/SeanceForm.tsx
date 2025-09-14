import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/RichTextEditor';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Seance } from '../types';
import { SEANCE_TYPES, ALL_CRENEAUX } from '../types';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';
import { Eye, BookOpen, GraduationCap, UserCheck, MoreHorizontal } from 'lucide-react';
import { useLiens } from '@/hooks/useLiens';

const SEANCE_TYPE_ICONS = {
  visite: Eye,
  formation: BookOpen,
  evaluation: GraduationCap,
  suivi: UserCheck,
  autre: MoreHorizontal,
};

// This interface needs to be kept in sync with the one in Seances.tsx
interface SeanceFormData {
  date: string;
  duree: number;
  type: Seance['type'];
  horaireMode?: 'ordinaire' | 'creneau';
  heure?: string;
  creneau?: typeof ALL_CRENEAUX[number] | '';
  notes: string;
  customType?: string;
}

interface SeanceFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editingSeance: Seance | null;
  formData: SeanceFormData;
  setFormData: React.Dispatch<React.SetStateAction<SeanceFormData>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

export function SeanceForm({
  isOpen,
  setIsOpen,
  editingSeance,
  formData,
  setFormData,
  handleSubmit,
  isLoading,
}: SeanceFormProps) {
  const selectableSeanceTypes = SEANCE_TYPES.filter(t => t.value !== 'formation' && t.value !== 'evaluation');
  const { saveLiens } = useLiens();

  const handleLinksExtracted = (links: string[]) => {
    if (editingSeance && links.length > 0) {
      saveLiens(links, 'seance', editingSeance.id);
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {editingSeance ? 'Modifier la séance' : 'Nouvelle séance'}
        </DialogTitle>
        <DialogDescription>
          Renseignez les informations de la séance de suivi
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="duree">Durée (heures)</Label>
            <Input
              id="duree"
              type="number"
              min="0.5"
              step="0.5"
              value={formData.duree}
              onChange={(e) => setFormData(prev => ({ ...prev, duree: parseFloat(e.target.value) }))}
              required
            />
          </div>
        </div>

        <div>
          <Label>Type de séance</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {selectableSeanceTypes.map((type) => {
              const Icon = SEANCE_TYPE_ICONS[type.value as keyof typeof SEANCE_TYPE_ICONS];
              return (
                <Button
                  key={type.value}
                  type="button"
                  variant={formData.type === type.value ? 'default' : 'outline'}
                  className="h-auto py-3 flex-col gap-1"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    type: type.value as Seance['type'],
                    customType: type.value === 'autre' ? prev.customType : ''
                  }))}
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
                placeholder="Ex: Coaching, Entretien, Atelier..."
              />
            </div>
          )}
        </div>

        <div>
          <Label>Mode horaire</Label>
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant={formData.horaireMode === 'ordinaire' ? 'default' : 'outline'}
              onClick={() => setFormData(prev => ({ ...prev, horaireMode: 'ordinaire' }))}
            >
              Horaire ordinaire
            </Button>
            <Button
              type="button"
              variant={formData.horaireMode === 'creneau' ? 'default' : 'outline'}
              onClick={() => setFormData(prev => ({ ...prev, horaireMode: 'creneau' }))}
            >
              Créneaux
            </Button>
          </div>
        </div>

        {formData.horaireMode === 'ordinaire' ? (
          <div>
            <Label htmlFor="heure">Heure</Label>
            <Input
              id="heure"
              type="time"
              value={formData.heure}
              onChange={(e) => setFormData(prev => ({ ...prev, heure: e.target.value }))}
              required
            />
          </div>
        ) : (
          <div>
            <Label>Créneau</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {ALL_CRENEAUX.map((creneau) => (
                <Button
                  key={creneau}
                  type="button"
                  variant={formData.creneau === creneau ? 'default' : 'outline'}
                  className={cn(
                    "text-xs",
                    formData.creneau === creneau && (
                      creneau.startsWith('M') ? 'bg-orange-500 hover:bg-orange-600' : 'bg-purple-500 hover:bg-purple-600'
                    )
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, creneau }))}
                >
                  {creneau}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="notes">Notes et observations</Label>
          <RichTextEditor
            value={formData.notes}
            onValueChange={(value) => {
              const newFormData = { ...formData, notes: value };
              setFormData(prev => ({ ...prev, notes: value }));
            }}
            onLinksExtracted={handleLinksExtracted}
            placeholder="Décrivez le contenu de la séance, les points abordés..."
            rows={6}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
            {editingSeance ? 'Modifier' : 'Créer'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
