import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Scale,
  Users,
  BookOpen,
  GraduationCap,
  Monitor,
  TrendingUp
} from 'lucide-react';

interface CompetenceGridProps {
  competences: any;
  onChange: (category: string, field: string, value: string) => void;
  rapportType?: 'intermediaire' | 'final';
}

// Valeurs pour le rapport intermédiaire
type CompetenceValueIntermed = 'entretenir' | 'travailler' | 'investir' | '';
// Valeurs pour le rapport final
type CompetenceValueFinal = 'suffisant' | 'insuffisant' | 'non_observe' | '';

type CompetenceValue = CompetenceValueIntermed | CompetenceValueFinal;

const categories = [
  {
    id: 'reglementaires',
    title: 'Compétences réglementaires et institutionnelles',
    subtitle: 'CC1, CC2, CC6',
    icon: Scale,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    items: [
      { id: 'principes_egalite', label: 'Respecte et fait respecter les principes d\'égalité, neutralité, laïcité, équité, tolérance' },
      { id: 'ponctualite', label: 'Répond aux exigences de ponctualité, assiduité, sécurité et confidentialité' },
      { id: 'positionnement_adulte', label: 'Adopte une attitude et un positionnement d\'adulte responsable' },
      { id: 'respect_eleves', label: 'Fait preuve de respect à l\'égard des élèves et de la communauté éducative' },
      { id: 'reglement_interieur', label: 'Fait respecter le règlement intérieur' },
    ]
  },
  {
    id: 'relationnelles',
    title: 'Compétences relationnelles et de communication',
    subtitle: 'CC7, CC10, CC11, CC12, CC13',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    items: [
      { id: 'langage_clair', label: 'Utilise un langage clair et adapté à son (ses) interlocuteur(s)' },
      { id: 'travail_equipe', label: 'Participe à sa mesure au travail d\'équipe mis en œuvre' },
      { id: 'ecoute_echanges', label: 'Adopte une attitude favorable à l\'écoute et aux échanges' },
      { id: 'participation_instances', label: 'Participe aux différentes instances et conseils' },
      { id: 'communication_familles', label: 'Communique autant que de besoin avec les familles' },
    ]
  },
  {
    id: 'disciplinaires',
    title: 'Compétences liées à la maîtrise des contenus disciplinaires',
    subtitle: 'P1, P2',
    icon: BookOpen,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    items: [
      { id: 'maitrise_contenus', label: 'Maîtrise les contenus disciplinaires et les concepts clés' },
      { id: 'transpositions_didactiques', label: 'Met en œuvre les transpositions didactiques appropriées' },
      { id: 'identification_savoirs', label: 'Identifie les savoirs et savoir-faire à acquérir en lien avec les programmes' },
    ]
  },
  {
    id: 'pedagogiques',
    title: 'Compétences éducatives et pédagogiques',
    subtitle: 'P3, P4, P5, CC3, CC4, CC5',
    icon: GraduationCap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    items: [
      { id: 'encadrement_groupe', label: 'Encadre les élèves et le groupe classe, fait preuve de vigilance et d\'autorité' },
      { id: 'climat_serein', label: 'Instaure un climat serein et de confiance au sein de la classe' },
      { id: 'encourage_valorise', label: 'Encourage et valorise ses élèves' },
      { id: 'objectifs_sens', label: 'Fixe les objectifs à atteindre et donne du sens aux apprentissages' },
      { id: 'diversite_eleves', label: 'Prend en compte la diversité des élèves et s\'assure de l\'adéquation des propositions' },
      { id: 'preparation_sequences', label: 'Prépare en amont les séquences pédagogiques dans une progression réfléchie' },
      { id: 'outils_evaluation', label: 'Met en place les outils et supports d\'évaluation en ciblant les compétences' },
      { id: 'suivi_travail', label: 'Prend en charge le suivi du travail personnel des élèves' },
      { id: 'regulation_pratique', label: 'S\'appuie sur l\'évaluation pour réguler sa pratique' },
    ]
  },
  {
    id: 'numeriques',
    title: 'Compétences numériques',
    subtitle: 'CC9',
    icon: Monitor,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    items: [
      { id: 'utilisation_outils', label: 'Utilise les outils numériques et réseaux mis en place dans l\'établissement' },
      { id: 'distinction_usages', label: 'Distingue les usages personnels et professionnels dans sa pratique' },
      { id: 'attention_eleves', label: 'Est attentif à la manière dont les élèves mobilisent l\'outil numérique' },
    ]
  },
  {
    id: 'developpement_pro',
    title: 'Compétences de développement professionnel',
    subtitle: 'CC14',
    icon: TrendingUp,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 dark:bg-teal-950/30',
    items: [
      { id: 'prise_compte_conseils', label: 'Prend en compte les conseils prodigués et s\'efforce d\'améliorer sa pratique' },
      { id: 'analyse_reflexive', label: 'Est capable de prendre du recul et de porter une analyse réflexive' },
    ]
  },
];

function CompetenceItem({
  item,
  value,
  onChange,
  rapportType = 'intermediaire',
}: {
  item: { id: string; label: string };
  value: CompetenceValue;
  onChange: (value: string) => void;
  rapportType?: 'intermediaire' | 'final';
}) {
  return (
    <div className="flex items-start gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg border">
      <div className="flex-1 min-w-0">
        <p className="text-sm">{item.label}</p>
      </div>
      <RadioGroup
        value={value || ''}
        onValueChange={onChange}
        className="flex gap-4"
      >
        {rapportType === 'intermediaire' ? (
          <>
            <div className="flex items-center gap-1">
              <RadioGroupItem value="entretenir" id={`${item.id}-entretenir`} className="text-green-600" />
              <Label htmlFor={`${item.id}-entretenir`} className="text-xs text-green-600 cursor-pointer">
                Entretenir
              </Label>
            </div>
            <div className="flex items-center gap-1">
              <RadioGroupItem value="travailler" id={`${item.id}-travailler`} className="text-orange-600" />
              <Label htmlFor={`${item.id}-travailler`} className="text-xs text-orange-600 cursor-pointer">
                Travailler
              </Label>
            </div>
            <div className="flex items-center gap-1">
              <RadioGroupItem value="investir" id={`${item.id}-investir`} className="text-red-600" />
              <Label htmlFor={`${item.id}-investir`} className="text-xs text-red-600 cursor-pointer">
                Investir
              </Label>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1">
              <RadioGroupItem value="suffisant" id={`${item.id}-suffisant`} className="text-green-600" />
              <Label htmlFor={`${item.id}-suffisant`} className="text-xs text-green-600 cursor-pointer">
                Suffisant
              </Label>
            </div>
            <div className="flex items-center gap-1">
              <RadioGroupItem value="insuffisant" id={`${item.id}-insuffisant`} className="text-red-600" />
              <Label htmlFor={`${item.id}-insuffisant`} className="text-xs text-red-600 cursor-pointer">
                Insuffisant
              </Label>
            </div>
            <div className="flex items-center gap-1">
              <RadioGroupItem value="non_observe" id={`${item.id}-non_observe`} className="text-gray-500" />
              <Label htmlFor={`${item.id}-non_observe`} className="text-xs text-gray-500 cursor-pointer">
                Non observé
              </Label>
            </div>
          </>
        )}
      </RadioGroup>
    </div>
  );
}

export function CompetenceGrid({ competences, onChange, rapportType = 'intermediaire' }: CompetenceGridProps) {
  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const Icon = category.icon;
        const categoryData = competences[category.id] || {};

        return (
          <Card key={category.id} className={`${category.bgColor} border-2`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white dark:bg-gray-800">
                  <Icon className={`h-5 w-5 ${category.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{category.subtitle}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {category.items.map((item) => (
                <CompetenceItem
                  key={item.id}
                  item={item}
                  value={categoryData[item.id] || ''}
                  onChange={(value) => onChange(category.id, item.id, value)}
                  rapportType={rapportType}
                />
              ))}

              <div className="pt-2">
                <Label className="text-sm font-medium">Commentaires</Label>
                <Textarea
                  value={categoryData.commentaire || ''}
                  onChange={(e) => onChange(category.id, 'commentaire', e.target.value)}
                  placeholder="Commentaires sur cette catégorie de compétences..."
                  rows={2}
                  className="mt-2 bg-white dark:bg-gray-800"
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
