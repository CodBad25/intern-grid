import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus } from 'lucide-react';
import { SeanceForm } from './SeanceForm';
import { Seance } from '../types';
import { SeanceFormData } from './Seances';

interface SeancesHeaderProps {
  userRole?: string;
  isFormOpen: boolean;
  setIsFormOpen: (isOpen: boolean) => void;
  resetForm: () => void;
  editingSeance: Seance | null;
  formData: SeanceFormData;
  setFormData: React.Dispatch<React.SetStateAction<SeanceFormData>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

export function SeancesHeader({
  userRole,
  isFormOpen,
  setIsFormOpen,
  resetForm,
  editingSeance,
  formData,
  setFormData,
  handleSubmit,
  isLoading,
}: SeancesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          Séances de suivi
        </h1>
        <p className="text-muted-foreground">
          Gestion des séances de formation et de suivi
        </p>
      </div>
      
      {(userRole === 'tuteur' || userRole === 'admin') && (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle séance
            </Button>
          </DialogTrigger>
          <SeanceForm
            isOpen={isFormOpen}
            setIsOpen={setIsFormOpen}
            editingSeance={editingSeance}
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </Dialog>
      )}
    </div>
  );
}
