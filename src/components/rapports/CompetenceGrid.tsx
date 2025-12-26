import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Scale,
  Users,
  BookOpen,
  GraduationCap,
  Monitor,
  TrendingUp
} from 'lucide-react';

interface TuteurProfile {
  user_id?: string;
  display_name?: string;
  avatar_url?: string;
  color?: string;
}

interface CompetenceGridProps {
  competences: any;
  onChange: (category: string, field: string, value: any) => void;
  rapportType?: 'intermediaire' | 'final';
  currentUserId?: string;
  tuteurProfiles?: { tuteur1?: TuteurProfile; tuteur2?: TuteurProfile };
}

const DEFAULT_TUTEUR1_COLOR = 'hsl(173, 58%, 39%)'; // Teal (Laurence)
const DEFAULT_TUTEUR2_COLOR = 'hsl(220, 90%, 56%)'; // Bleu (Badri)

// Valeurs possibles
const valuesIntermed = [
  { id: 'entretenir', label: 'À entretenir', color: 'bg-green-500', textColor: 'text-green-700' },
  { id: 'travailler', label: 'À travailler', color: 'bg-orange-500', textColor: 'text-orange-700' },
  { id: 'investir', label: 'À investir', color: 'bg-red-500', textColor: 'text-red-700' },
];

const valuesFinal = [
  { id: 'suffisant', label: 'Suffisant', color: 'bg-green-500', textColor: 'text-green-700' },
  { id: 'insuffisant', label: 'Insuffisant', color: 'bg-red-500', textColor: 'text-red-700' },
  { id: 'non_observe', label: 'Non observé', color: 'bg-gray-400', textColor: 'text-gray-600' },
];

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

// Composant pour un bouton d'avis d'un tuteur
function TuteurAvisButton({
  value,
  selectedValue,
  onClick,
  isCurrentUser,
  tuteurColor,
}: {
  value: { id: string; label: string; color: string; textColor: string };
  selectedValue: string | undefined;
  onClick: () => void;
  isCurrentUser: boolean;
  tuteurColor: string;
}) {
  const isSelected = selectedValue === value.id;

  return (
    <button
      onClick={isCurrentUser ? onClick : undefined}
      disabled={!isCurrentUser}
      className={`
        px-2 py-1 rounded-md text-xs font-medium transition-all
        ${isSelected
          ? `${value.color} text-white shadow-sm`
          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
        }
        ${isCurrentUser ? 'cursor-pointer' : 'cursor-default opacity-60'}
      `}
      title={isCurrentUser ? `Cliquer pour sélectionner "${value.label}"` : 'Seul ce tuteur peut modifier son avis'}
    >
      {value.label.replace('À ', '')}
    </button>
  );
}

// Composant pour afficher l'avis d'un tuteur
function TuteurAvisRow({
  tuteurProfile,
  tuteurKey,
  itemValue,
  values,
  onSelect,
  isCurrentUser,
}: {
  tuteurProfile?: TuteurProfile;
  tuteurKey: 'tuteur1' | 'tuteur2';
  itemValue: any;
  values: typeof valuesIntermed;
  onSelect: (value: string) => void;
  isCurrentUser: boolean;
}) {
  const tuteurColor = tuteurProfile?.color || (tuteurKey === 'tuteur1' ? DEFAULT_TUTEUR1_COLOR : DEFAULT_TUTEUR2_COLOR);
  const initials = tuteurProfile?.display_name?.split(' ').map(n => n[0]).join('').toUpperCase() || (tuteurKey === 'tuteur1' ? 'T1' : 'T2');
  const selectedValue = itemValue?.[tuteurKey];

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6 border-2" style={{ borderColor: tuteurColor }}>
        {tuteurProfile?.avatar_url ? (
          <AvatarImage src={tuteurProfile.avatar_url} alt={tuteurProfile.display_name} />
        ) : null}
        <AvatarFallback style={{ backgroundColor: tuteurColor, color: 'white' }} className="text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex gap-1">
        {values.map((v) => (
          <TuteurAvisButton
            key={v.id}
            value={v}
            selectedValue={selectedValue}
            onClick={() => onSelect(v.id)}
            isCurrentUser={isCurrentUser}
            tuteurColor={tuteurColor}
          />
        ))}
      </div>
    </div>
  );
}

// Composant pour afficher le statut de consensus
function ConsensusStatus({ itemValue }: { itemValue: any }) {
  const tuteur1Value = itemValue?.tuteur1;
  const tuteur2Value = itemValue?.tuteur2;

  if (!tuteur1Value && !tuteur2Value) {
    return <span className="text-xs text-gray-400">En attente</span>;
  }

  if (!tuteur1Value || !tuteur2Value) {
    return <span className="text-xs text-gray-400">1 avis manquant</span>;
  }

  if (tuteur1Value === tuteur2Value) {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
        <CheckCircle2 className="h-3 w-3" />
        Consensus
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-xs text-orange-600 font-medium">
      <AlertCircle className="h-3 w-3" />
      À discuter
    </span>
  );
}

// Composant pour une compétence avec double avis
function CompetenceItemDual({
  item,
  itemValue,
  onChange,
  rapportType,
  currentUserId,
  tuteurProfiles,
}: {
  item: { id: string; label: string };
  itemValue: any;
  onChange: (tuteurKey: 'tuteur1' | 'tuteur2', value: string) => void;
  rapportType: 'intermediaire' | 'final';
  currentUserId?: string;
  tuteurProfiles?: { tuteur1?: TuteurProfile; tuteur2?: TuteurProfile };
}) {
  const values = rapportType === 'intermediaire' ? valuesIntermed : valuesFinal;
  const tuteur1Id = tuteurProfiles?.tuteur1?.user_id;
  const tuteur2Id = tuteurProfiles?.tuteur2?.user_id;

  const isCurrentUserTuteur1 = currentUserId === tuteur1Id;
  const isCurrentUserTuteur2 = currentUserId === tuteur2Id;

  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border space-y-2">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm flex-1">{item.label}</p>
        <ConsensusStatus itemValue={itemValue} />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-1 border-t border-gray-100 dark:border-gray-700">
        <TuteurAvisRow
          tuteurProfile={tuteurProfiles?.tuteur1}
          tuteurKey="tuteur1"
          itemValue={itemValue}
          values={values}
          onSelect={(value) => onChange('tuteur1', value)}
          isCurrentUser={isCurrentUserTuteur1}
        />
        <TuteurAvisRow
          tuteurProfile={tuteurProfiles?.tuteur2}
          tuteurKey="tuteur2"
          itemValue={itemValue}
          values={values}
          onSelect={(value) => onChange('tuteur2', value)}
          isCurrentUser={isCurrentUserTuteur2}
        />
      </div>
    </div>
  );
}

export function CompetenceGrid({
  competences,
  onChange,
  rapportType = 'intermediaire',
  currentUserId,
  tuteurProfiles,
}: CompetenceGridProps) {

  const handleItemChange = (categoryId: string, itemId: string, tuteurKey: 'tuteur1' | 'tuteur2', value: string) => {
    const currentCategoryData = competences[categoryId] || {};
    const currentItemValue = currentCategoryData[itemId] || {};

    const newItemValue = {
      ...currentItemValue,
      [tuteurKey]: value,
    };

    onChange(categoryId, itemId, newItemValue);
  };

  return (
    <div className="space-y-6">
      {/* Légende */}
      <div className="flex flex-wrap items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
        <span className="text-sm font-medium">Légende :</span>
        <span className="flex items-center gap-1 text-xs">
          <CheckCircle2 className="h-3 w-3 text-green-600" />
          <span className="text-green-600">Consensus</span>
          <span className="text-gray-500 ml-1">= les deux tuteurs sont d'accord</span>
        </span>
        <span className="flex items-center gap-1 text-xs">
          <AlertCircle className="h-3 w-3 text-orange-600" />
          <span className="text-orange-600">À discuter</span>
          <span className="text-gray-500 ml-1">= avis différents</span>
        </span>
      </div>

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
                <CompetenceItemDual
                  key={item.id}
                  item={item}
                  itemValue={categoryData[item.id]}
                  onChange={(tuteurKey, value) => handleItemChange(category.id, item.id, tuteurKey, value)}
                  rapportType={rapportType}
                  currentUserId={currentUserId}
                  tuteurProfiles={tuteurProfiles}
                />
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
