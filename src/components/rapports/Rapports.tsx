import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Calendar,
  Lock,
  Edit,
  Eye,
  Share2,
  CheckCircle2,
  Clock,
  Users,
  Download
} from 'lucide-react';
import { useRapports } from '@/hooks/useRapports';
import { RapportForm } from './RapportForm';
import { RapportView } from './RapportView';
import { useAuth } from '@/context/AuthContext';

type RapportType = 'intermediaire' | 'final';
type ViewMode = 'list' | 'edit' | 'view';

const statusConfig = {
  brouillon: { label: 'Brouillon', color: 'bg-gray-500', icon: Edit },
  en_cours: { label: 'En cours', color: 'bg-blue-500', icon: Clock },
  complet: { label: 'Complet', color: 'bg-green-500', icon: CheckCircle2 },
  partage: { label: 'Partagé', color: 'bg-purple-500', icon: Share2 },
};

export function Rapports() {
  const { user } = useAuth();
  const { rapportIntermediaire, rapportFinal, isLoading, createRapport, updateRapport } = useRapports();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedType, setSelectedType] = useState<RapportType | null>(null);

  const calculateProgress = (rapport: any): number => {
    if (!rapport) return 0;

    let filled = 0;
    let total = 0;

    // Informations stagiaire (5 champs)
    total += 5;
    if (rapport.stagiaire_nom) filled++;
    if (rapport.stagiaire_prenom) filled++;
    if (rapport.stagiaire_corps) filled++;
    if (rapport.stagiaire_etablissement) filled++;
    if (rapport.stagiaire_discipline) filled++;

    // Modalités (5 champs)
    total += 5;
    const modalites = rapport.modalites || {};
    if (modalites.visites_tuteur) filled++;
    if (modalites.visites_stagiaire) filled++;
    if (modalites.classes_observees_tuteur) filled++;
    if (modalites.classes_observees_stagiaire) filled++;
    if (modalites.concertations) filled++;

    // Axes (4 axes x 4 champs = 16)
    total += 16;
    const axes = rapport.axes || [];
    axes.forEach((axe: any) => {
      if (axe.titre) filled++;
      if (axe.constat_depart) filled++;
      if (axe.evolution) filled++;
      if (axe.etat_actuel) filled++;
    });

    // Compétences (27 items, consensus requis = les 2 tuteurs doivent avoir voté)
    const competenceItems = 27; // Nombre total de compétences à évaluer
    total += competenceItems;
    const competences = rapport.competences || {};
    let competencesFilled = 0;
    Object.values(competences).forEach((cat: any) => {
      if (cat && typeof cat === 'object') {
        Object.values(cat).forEach((item: any) => {
          // Nouveau format: { tuteur1: 'value', tuteur2: 'value' }
          if (item && typeof item === 'object' && item.tuteur1 && item.tuteur2) {
            competencesFilled++;
          }
          // Ancien format: valeur simple
          else if (item && typeof item === 'string' && item !== '') {
            competencesFilled++;
          }
        });
      }
    });
    filled += Math.min(competencesFilled, competenceItems);

    // Synthèse (axes fin d'année)
    total += 2;
    const axesFinAnnee = rapport.axes_fin_annee || {};
    if (axesFinAnnee.a_conforter) filled++;
    if (axesFinAnnee.a_travailler) filled++;

    return Math.round((filled / total) * 100);
  };

  const handleOpenRapport = (type: RapportType, mode: 'edit' | 'view') => {
    setSelectedType(type);
    setViewMode(mode);
  };

  const handleCreateRapport = async (type: RapportType) => {
    await createRapport(type);
    setSelectedType(type);
    setViewMode('edit');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedType(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (viewMode === 'edit' && selectedType) {
    const rapport = selectedType === 'intermediaire' ? rapportIntermediaire : rapportFinal;
    return (
      <RapportForm
        rapport={rapport}
        type={selectedType}
        onBack={handleBack}
        onSave={updateRapport}
      />
    );
  }

  if (viewMode === 'view' && selectedType) {
    const rapport = selectedType === 'intermediaire' ? rapportIntermediaire : rapportFinal;
    return (
      <RapportView
        rapport={rapport}
        type={selectedType}
        onBack={handleBack}
      />
    );
  }

  const intermediateProgress = calculateProgress(rapportIntermediaire);
  const finalProgress = calculateProgress(rapportFinal);
  const canEditFinal = rapportIntermediaire?.status === 'complet' || rapportIntermediaire?.status === 'partage';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapports</h1>
          <p className="text-muted-foreground mt-1">
            Rapports d'évaluation du stagiaire - Année scolaire 2025-2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Co-tuteurs connectés
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rapport Intermédiaire */}
        <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Rapport Intermédiaire</CardTitle>
                  <CardDescription>Bilan de mi-parcours</CardDescription>
                </div>
              </div>
              {rapportIntermediaire && (
                <Badge
                  className={`${statusConfig[rapportIntermediaire.status as keyof typeof statusConfig]?.color} text-white`}
                >
                  {statusConfig[rapportIntermediaire.status as keyof typeof statusConfig]?.label}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Échéance : <strong>17 janvier 2026</strong></span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progression</span>
                <span className="font-medium">{intermediateProgress}%</span>
              </div>
              <Progress value={intermediateProgress} className="h-2" />
            </div>

            <div className="flex gap-2 pt-2">
              {rapportIntermediaire ? (
                <>
                  <Button
                    className="flex-1"
                    onClick={() => handleOpenRapport('intermediaire', 'edit')}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleOpenRapport('intermediaire', 'view')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleCreateRapport('intermediaire')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Créer le rapport
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rapport Final */}
        <Card className={`relative overflow-hidden border-2 transition-colors ${
          canEditFinal ? 'hover:border-primary/50' : 'opacity-75'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${canEditFinal ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  {canEditFinal ? (
                    <FileText className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <Lock className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <CardTitle>Rapport Final</CardTitle>
                  <CardDescription>Bilan de fin d'année</CardDescription>
                </div>
              </div>
              {rapportFinal ? (
                <Badge
                  className={`${statusConfig[rapportFinal.status as keyof typeof statusConfig]?.color} text-white`}
                >
                  {statusConfig[rapportFinal.status as keyof typeof statusConfig]?.label}
                </Badge>
              ) : !canEditFinal && (
                <Badge variant="secondary">
                  <Lock className="h-3 w-3 mr-1" />
                  Verrouillé
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Échéance : <strong>Juin 2026</strong></span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progression</span>
                <span className="font-medium">{finalProgress}%</span>
              </div>
              <Progress value={finalProgress} className="h-2" />
            </div>

            <div className="flex gap-2 pt-2">
              {canEditFinal ? (
                rapportFinal ? (
                  <>
                    <Button
                      className="flex-1"
                      onClick={() => handleOpenRapport('final', 'edit')}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleOpenRapport('final', 'view')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleCreateRapport('final')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Créer le rapport
                  </Button>
                )
              ) : (
                <Button className="w-full" disabled>
                  <Lock className="h-4 w-4 mr-2" />
                  Terminez d'abord le rapport intermédiaire
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info box */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 h-fit">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Collaboration en temps réel
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Vous et votre co-tuteur pouvez modifier le rapport simultanément.
                Les modifications sont synchronisées automatiquement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Rapports;
