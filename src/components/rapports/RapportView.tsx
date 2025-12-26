import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Printer,
  Download,
  FileText,
  Calendar,
  User,
  Users,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { useRapportPDF } from '@/hooks/useRapportPDF';

interface RapportViewProps {
  rapport: any;
  type: 'intermediaire' | 'final';
  onBack: () => void;
}

// Labels pour le rapport intermédiaire
const competenceLabelsIntermed: Record<string, string> = {
  entretenir: 'À entretenir',
  travailler: 'À travailler',
  investir: 'À investir',
};

// Labels pour le rapport final
const competenceLabelsFinal: Record<string, string> = {
  suffisant: 'Suffisant',
  insuffisant: 'Insuffisant',
  non_observe: 'Non observé',
};

const competenceColorsIntermed: Record<string, string> = {
  entretenir: 'text-green-600 bg-green-100',
  travailler: 'text-orange-600 bg-orange-100',
  investir: 'text-red-600 bg-red-100',
};

const competenceColorsFinal: Record<string, string> = {
  suffisant: 'text-green-600 bg-green-100',
  insuffisant: 'text-red-600 bg-red-100',
  non_observe: 'text-gray-500 bg-gray-100',
};

export function RapportView({ rapport, type, onBack }: RapportViewProps) {
  const { generatePDF, isGenerating } = useRapportPDF();

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (rapport) {
      await generatePDF(rapport, type);
    }
  };

  if (!rapport) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Aucun rapport à afficher</p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header - Hidden on print */}
      <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-4 border-b print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Rapport {type === 'intermediaire' ? 'Intermédiaire' : 'Final'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {rapport.stagiaire_prenom} {rapport.stagiaire_nom} - {rapport.annee_scolaire || '2025-2026'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button onClick={handleExportPDF} disabled={isGenerating}>
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? 'Génération...' : 'Export PDF'}
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-xl font-bold">
          Rapport {type === 'intermediaire' ? 'Intermédiaire' : 'Final'} 2025-2026
        </h1>
        <p className="text-sm">DU TUTEUR ÉTABLISSEMENT D'UN PROFESSEUR STAGIAIRE</p>
      </div>

      {/* Informations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Stagiaire
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><strong>Nom :</strong> {rapport.stagiaire_nom}</p>
            <p><strong>Prénom :</strong> {rapport.stagiaire_prenom}</p>
            <p><strong>Corps :</strong> {rapport.stagiaire_corps}</p>
            <p><strong>Établissement :</strong> {rapport.stagiaire_etablissement}</p>
            <p><strong>Discipline :</strong> {rapport.stagiaire_discipline}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Tuteur 1
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><strong>Nom :</strong> {rapport.tuteur1_nom}</p>
            <p><strong>Prénom :</strong> {rapport.tuteur1_prenom}</p>
            <p><strong>Établissement :</strong> {rapport.tuteur1_etablissement}</p>
            <p><strong>Discipline :</strong> {rapport.tuteur1_discipline}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Tuteur 2
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><strong>Nom :</strong> {rapport.tuteur2_nom}</p>
            <p><strong>Prénom :</strong> {rapport.tuteur2_prenom}</p>
            <p><strong>Établissement :</strong> {rapport.tuteur2_etablissement}</p>
            <p><strong>Discipline :</strong> {rapport.tuteur2_discipline}</p>
          </CardContent>
        </Card>
      </div>

      {/* Modalités (intermédiaire uniquement) */}
      {type === 'intermediaire' && (
        <Card className="print:break-inside-avoid">
          <CardHeader>
            <CardTitle>Modalités d'accompagnement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Visites des tuteurs</p>
                <p>{rapport.modalites?.visites_tuteur || '-'}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Visites du stagiaire</p>
                <p>{rapport.modalites?.visites_stagiaire || '-'}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Classes observées (tuteurs)</p>
                <p>{rapport.modalites?.classes_observees_tuteur || '-'}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Classes observées (stagiaire)</p>
                <p>{rapport.modalites?.classes_observees_stagiaire || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="font-medium text-muted-foreground">Concertations</p>
                <p>{rapport.modalites?.concertations || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Axes (intermédiaire uniquement) */}
      {type === 'intermediaire' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Axes thématiques de formation</h2>
          {(rapport.axes || []).map((axe: any, index: number) => (
            axe?.titre && (
              <Card key={index} className="print:break-inside-avoid">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Axe {index + 1} : {axe.titre}
                    </CardTitle>
                    <Badge variant="outline">
                      {index < 2 ? 'Transversal' : 'Disciplinaire'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Constat de départ</p>
                      <p className="whitespace-pre-wrap">{axe.constat_depart || '-'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Évolution constatée</p>
                      <p className="whitespace-pre-wrap">{axe.evolution || '-'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">État des lieux</p>
                      <p className="whitespace-pre-wrap">{axe.etat_actuel || '-'}</p>
                    </div>
                  </div>
                  {axe.competences && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm">
                        <strong>Compétences associées :</strong> {axe.competences}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          ))}
        </div>
      )}

      {/* Compétences synthèse */}
      <Card className="print:break-inside-avoid">
        <CardHeader>
          <CardTitle>
            {type === 'intermediaire' ? 'Synthèse des compétences' : 'Évaluation des compétences'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(rapport.competences || {}).map(([category, items]: [string, any]) => {
              const filledItems = Object.entries(items).filter(
                ([key, value]) => key !== 'commentaire' && value
              );
              if (filledItems.length === 0) return null;

              const labels = type === 'intermediaire' ? competenceLabelsIntermed : competenceLabelsFinal;
              const colors = type === 'intermediaire' ? competenceColorsIntermed : competenceColorsFinal;

              return (
                <div key={category}>
                  <h4 className="font-medium capitalize mb-2">
                    {category.replace(/_/g, ' ')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {filledItems.map(([key, value]: [string, any]) => (
                      <Badge
                        key={key}
                        className={colors[value as string] || 'bg-gray-100'}
                      >
                        {key.replace(/_/g, ' ')}: {labels[value as string] || value}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Axes fin d'année (intermédiaire) ou Synthèse (final) */}
      {type === 'intermediaire' ? (
        <Card className="print:break-inside-avoid">
          <CardHeader>
            <CardTitle>Axes de travail pour la fin de l'année</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium text-muted-foreground mb-2">Compétences à conforter</p>
              <p className="whitespace-pre-wrap text-sm">
                {rapport.axes_fin_annee?.a_conforter || '-'}
              </p>
            </div>
            <Separator />
            <div>
              <p className="font-medium text-muted-foreground mb-2">Nouvelles compétences à travailler</p>
              <p className="whitespace-pre-wrap text-sm">
                {rapport.axes_fin_annee?.a_travailler || '-'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="print:break-inside-avoid">
          <CardHeader>
            <CardTitle>Synthèse du parcours de formation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">
              {rapport.synthese?.contenu || '-'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Signatures */}
      <Card className="print:break-inside-avoid">
        <CardHeader>
          <CardTitle>Signatures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <p className="font-medium mb-2">Tuteur 1</p>
              <p className="text-sm text-muted-foreground mb-4">
                {rapport.tuteur1_prenom} {rapport.tuteur1_nom}
              </p>
              {rapport.signature_tuteur1_date ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">
                    Signé le {new Date(rapport.signature_tuteur1_date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Circle className="h-4 w-4" />
                  <span className="text-sm">Non signé</span>
                </div>
              )}
            </div>

            <div className="text-center p-4 border rounded-lg">
              <p className="font-medium mb-2">Tuteur 2</p>
              <p className="text-sm text-muted-foreground mb-4">
                {rapport.tuteur2_prenom} {rapport.tuteur2_nom}
              </p>
              {rapport.signature_tuteur2_date ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">
                    Signé le {new Date(rapport.signature_tuteur2_date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Circle className="h-4 w-4" />
                  <span className="text-sm">Non signé</span>
                </div>
              )}
            </div>

            <div className="text-center p-4 border rounded-lg">
              <p className="font-medium mb-2">Stagiaire</p>
              <p className="text-sm text-muted-foreground mb-4">
                {rapport.stagiaire_prenom} {rapport.stagiaire_nom}
              </p>
              {rapport.signature_stagiaire_date ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">
                    Signé le {new Date(rapport.signature_stagiaire_date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Circle className="h-4 w-4" />
                  <span className="text-sm">En attente</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print footer */}
      <div className="hidden print:block text-center text-xs text-muted-foreground mt-8 pt-4 border-t">
        <p>Document généré depuis l'application Suivi de Stagiaires</p>
        <p>Référentiel : BO n°30 du 25 juillet 2013</p>
      </div>
    </div>
  );
}
