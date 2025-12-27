import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Save,
  Eye,
  Share2,
  Printer,
  CheckCircle2,
  Check,
  Circle,
  Users,
  FileText,
  ClipboardList,
  Target,
  GraduationCap,
  Sparkles,
  Clock,
  Wand2,
  Loader2,
  User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AxeSection } from './AxeSection';
import { CompetenceGrid } from './CompetenceGrid';
import { CollaborationIndicator } from './CollaborationIndicator';
import { RapportPrintView } from './RapportPrintView';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface RapportFormProps {
  rapport: any;
  type: 'intermediaire' | 'final';
  onBack: () => void;
  onSave: (id: string, data: any) => Promise<void>;
}

// Tabs différents selon le type de rapport
const getTabsForType = (type: 'intermediaire' | 'final') => {
  if (type === 'final') {
    // Rapport final: pas de modalités ni d'axes thématiques
    return ['informations', 'competences', 'synthese'];
  }
  // Rapport intermédiaire: toutes les sections
  return ['informations', 'modalites', 'axes', 'competences', 'synthese'];
};

const defaultAxes = [
  { titre: '', constat_depart: '', evolution: '', etat_actuel: '', competences: '' },
  { titre: '', constat_depart: '', evolution: '', etat_actuel: '', competences: '' },
  { titre: '', constat_depart: '', evolution: '', etat_actuel: '', competences: '' },
  { titre: '', constat_depart: '', evolution: '', etat_actuel: '', competences: '' },
];

// Couleurs par défaut (seront remplacées par celles des profils)
const DEFAULT_TUTEUR1_COLOR = 'hsl(173, 58%, 39%)'; // Teal (Laurence)
const DEFAULT_TUTEUR2_COLOR = 'hsl(220, 90%, 56%)'; // Bleu (Badri)

export function RapportForm({ rapport, type, onBack, onSave }: RapportFormProps) {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState<any>(rapport || {});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('informations');
  const [tuteurProfiles, setTuteurProfiles] = useState<{tuteur1?: any, tuteur2?: any}>({});
  const [showPrintView, setShowPrintView] = useState(false);



  const debouncedFormData = useDebounce(formData, 2000);

  // Charger les profils des tuteurs pour avoir les avatars
  useEffect(() => {
    const fetchProfiles = async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      if (profiles) {
        // Trouver Laurence (tuteur1) et Badri (tuteur2) par leur nom
        const laurence = profiles.find(p =>
          p.display_name?.toLowerCase().includes('laurence') ||
          p.display_name?.toLowerCase().includes('mauny')
        );
        const badri = profiles.find(p =>
          p.display_name?.toLowerCase().includes('badri') ||
          p.display_name?.toLowerCase().includes('belhaj')
        );

        setTuteurProfiles({
          tuteur1: laurence,
          tuteur2: badri
        });
      }
    };
    fetchProfiles();
  }, []);

  // Auto-save
  useEffect(() => {
    if (rapport?.id && debouncedFormData && Object.keys(debouncedFormData).length > 0) {
      handleAutoSave();
    }
  }, [debouncedFormData]);

  const handleAutoSave = async () => {
    if (!rapport?.id) return;
    try {
      setIsSaving(true);
      await onSave(rapport.id, formData);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Erreur auto-save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = useCallback((path: string, value: any) => {
    setFormData((prev: any) => {
      const newData = { ...prev };
      const parts = path.split('.');
      let current = newData;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }

      current[parts[parts.length - 1]] = value;
      return newData;
    });
  }, []);

  const updateAxe = useCallback((index: number, field: string, value: string) => {
    setFormData((prev: any) => {
      const newAxes = [...(prev.axes || defaultAxes)];
      if (!newAxes[index]) {
        newAxes[index] = { titre: '', constat_depart: '', evolution: '', etat_actuel: '', competences: '' };
      }
      newAxes[index] = { ...newAxes[index], [field]: value };
      return { ...prev, axes: newAxes };
    });
  }, []);

  const updateCompetence = useCallback((category: string, field: string, value: string) => {
    setFormData((prev: any) => {
      const newCompetences = { ...prev.competences };
      if (!newCompetences[category]) {
        newCompetences[category] = {};
      }
      newCompetences[category] = { ...newCompetences[category], [field]: value };
      return { ...prev, competences: newCompetences };
    });
  }, []);

  // Fonction pour pré-remplir les modalités depuis les séances
  const [isLoadingModalites, setIsLoadingModalites] = useState(false);

  const prefillModalites = async () => {
    setIsLoadingModalites(true);
    try {
      // Récupérer toutes les séances avec les profils
      const { data: seances, error } = await supabase
        .from('seances')
        .select(`
          *,
          profiles:tuteur_id (display_name, color, avatar_url)
        `)
        .order('date', { ascending: true });

      if (error) throw error;

      // ===== VISITES DES TUTEURS (Laurence et Badri visitant Barbara) =====
      // Inclut: type='visite' OU (type='suivi' avec classe_visitee renseignée)
      const visitesTuteurs = seances?.filter(s => {
        const nom = (s.profiles?.display_name || '').toLowerCase();
        // UNIQUEMENT Laurence ou Badri, PAS Barbara
        if (!nom.includes('laurence') && !nom.includes('badri')) return false;

        // Type visite direct
        if (s.type === 'visite') return true;

        // Type suivi avec classe visitée = c'est une visite
        if (s.type === 'suivi' && s.classe_visitee) return true;

        // Custom label mentionnant visite/observation
        const label = (s.custom_label || '').toLowerCase();
        if (label.includes('visite') || label.includes('observation')) return true;

        return false;
      }) || [];

      // Grouper par tuteur pour le texte
      const parTuteur: Record<string, string[]> = {};
      visitesTuteurs.forEach(s => {
        const nom = s.profiles?.display_name || '';
        const prenom = nom.split(' ')[0];
        const date = new Date(s.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        if (!parTuteur[prenom]) parTuteur[prenom] = [];
        parTuteur[prenom].push(date);
      });

      // Texte simple : juste le nombre (les dates sont en badges colorés)
      const visitesTexte = visitesTuteurs.length > 0
        ? `${visitesTuteurs.length} visite${visitesTuteurs.length > 1 ? 's' : ''}`
        : '';

      // Données pour badges colorés (dates avec couleur du tuteur, sans nom)
      const datesColorees = visitesTuteurs.map(s => ({
        date: new Date(s.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        color: s.profiles?.color || DEFAULT_TUTEUR2_COLOR
      }));

      // Classes de Barbara observées par les tuteurs
      const classesTuteur = [...new Set(
        visitesTuteurs.filter(s => s.classe_visitee).map(s => s.classe_visitee)
      )].join(', ');

      // ===== OBSERVATIONS DU STAGIAIRE (Barbara visitant les tuteurs) =====
      // Peut être enregistré par Barbara OU par un tuteur avec mention dans les notes
      const observationsStagiaire = seances?.filter(s => {
        const nom = (s.profiles?.display_name || '').toLowerCase();
        const notes = (s.notes || '').toLowerCase();
        const label = (s.custom_label || '').toLowerCase();

        // Séances créées par Barbara (visite ou suivi avec classe)
        if (nom.includes('barbara')) {
          if (s.type === 'visite') return true;
          if (s.type === 'suivi' && s.classe_visitee) return true;
          if (label.includes('observation')) return true;
        }

        // Séances créées par les tuteurs MAIS mentionnant observation de Barbara
        if (nom.includes('laurence') || nom.includes('badri')) {
          if (notes.includes('barbara') && (notes.includes('observe') || notes.includes('observation'))) return true;
          if (label.includes('observation') && label.includes('barbara')) return true;
          if (label.includes('obs barbara') || label.includes('observation barbara')) return true;
          // Custom label contenant juste "observation" (stagiaire observe le tuteur)
          if (label.includes('observation stagiaire') || label.includes('obs stg')) return true;
        }

        return false;
      }) || [];

      const datesObs = observationsStagiaire.map(s =>
        new Date(s.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
      );
      const obsTexte = observationsStagiaire.length > 0
        ? `${observationsStagiaire.length} observation${observationsStagiaire.length > 1 ? 's' : ''} (${datesObs.join(', ')})`
        : '';

      // Classes des tuteurs observées par Barbara
      // Chercher dans classe_visitee OU dans les notes/label
      const classesFromObs: string[] = [];
      observationsStagiaire.forEach(s => {
        if (s.classe_visitee) {
          classesFromObs.push(s.classe_visitee);
        }
        // Chercher des classes dans les notes (ex: "6ème", "3ème", "seconde")
        const notes = s.notes || '';
        const label = s.custom_label || '';
        const texte = `${notes} ${label}`.toLowerCase();

        // Pattern pour trouver les classes
        const classPatterns = [
          /\b(6[èe]me?|6b|6c|6a)\b/gi,
          /\b(5[èe]me?|5b|5c|5a)\b/gi,
          /\b(4[èe]me?|4b|4c|4a)\b/gi,
          /\b(3[èe]me?|3b|3c|3a)\b/gi,
          /\b(seconde|2nde?|2b|2c|2a)\b/gi,
          /\b(premi[èe]re|1[èe]re?|1b|1c|1a)\b/gi,
          /\b(terminale|tle?|tb|tc|ta)\b/gi,
        ];

        classPatterns.forEach(pattern => {
          const matches = texte.match(pattern);
          if (matches) {
            classesFromObs.push(...matches.map(m => m.toUpperCase()));
          }
        });
      });

      const classesStagiaire = [...new Set(classesFromObs)].join(', ');

      // ===== CONCERTATIONS (toutes les séances sauf visites) =====
      // On exclut seulement les visites (type='visite' ou suivi avec classe)
      const idsVisites = new Set([
        ...visitesTuteurs.map(s => s.id),
        ...observationsStagiaire.map(s => s.id)
      ]);

      const concertations = seances?.filter(s => {
        // Exclure les séances déjà comptées comme visites
        if (idsVisites.has(s.id)) return false;

        // Inclure: suivi, formation, autre
        if (s.type === 'suivi') return true;
        if (s.type === 'formation') return true;
        if (s.type === 'autre') return true;

        return false;
      }) || [];

      // duree est en HEURES (pas minutes!)
      const dureeTotale = concertations.reduce((acc, s) => acc + (s.duree || 0), 0);
      const heures = Math.floor(dureeTotale);
      const minutes = Math.round((dureeTotale - heures) * 60);
      const concertationsTexte = concertations.length > 0
        ? `${concertations.length} séance${concertations.length > 1 ? 's' : ''} (~${heures}h${minutes > 0 ? String(minutes).padStart(2, '0') : ''} total)`
        : '';

      // Mise à jour du formulaire
      setFormData((prev: any) => ({
        ...prev,
        modalites: {
          ...prev.modalites,
          visites_tuteur: visitesTexte,
          visites_tuteur_dates: datesColorees, // Pour l'affichage coloré
          visites_stagiaire: obsTexte,
          classes_observees_tuteur: classesTuteur,
          classes_observees_stagiaire: classesStagiaire,
          concertations: concertationsTexte,
        }
      }));

      toast.success('Modalités pré-remplies depuis les séances');
    } catch (error) {
      console.error('Erreur lors du pré-remplissage:', error);
      toast.error('Erreur lors du chargement des séances');
    } finally {
      setIsLoadingModalites(false);
    }
  };

  const handleShare = async () => {
    if (!rapport?.id) return;
    try {
      await onSave(rapport.id, { ...formData, shared_with_stagiaire: true, status: 'partage' });
      toast.success('Rapport partagé avec le stagiaire');
    } catch (error) {
      toast.error('Erreur lors du partage');
    }
  };

  const handlePrint = () => {
    setShowPrintView(true);
  };

  const calculateProgress = (): number => {
    let filled = 0;
    let total = 0;

    // Informations (commun aux deux types)
    total += 5;
    if (formData.stagiaire_nom) filled++;
    if (formData.stagiaire_prenom) filled++;
    if (formData.stagiaire_etablissement) filled++;
    if (formData.tuteur1_nom) filled++;
    if (formData.tuteur2_nom) filled++;

    if (type === 'intermediaire') {
      // Modalités (intermédiaire uniquement)
      total += 5;
      const modalites = formData.modalites || {};
      if (modalites.visites_tuteur) filled++;
      if (modalites.visites_stagiaire) filled++;
      if (modalites.classes_observees_tuteur) filled++;
      if (modalites.classes_observees_stagiaire) filled++;
      if (modalites.concertations) filled++;

      // Axes (4 axes x 4 champs) (intermédiaire uniquement)
      total += 16;
      const axes = formData.axes || [];
      axes.forEach((axe: any) => {
        if (axe?.titre) filled++;
        if (axe?.constat_depart) filled++;
        if (axe?.evolution) filled++;
        if (axe?.etat_actuel) filled++;
      });
    } else {
      // Rapport final: synthèse obligatoire
      total += 1;
      if (formData.synthese?.contenu) filled++;
    }

    // Compétences (commun, mais comptage simplifié)
    total += 6; // 6 catégories
    const competences = formData.competences || {};
    if (Object.keys(competences.reglementaires || {}).length > 1) filled++;
    if (Object.keys(competences.relationnelles || {}).length > 1) filled++;
    if (Object.keys(competences.disciplinaires || {}).length > 1) filled++;
    if (Object.keys(competences.pedagogiques || {}).length > 1) filled++;
    if (Object.keys(competences.numeriques || {}).length > 1) filled++;
    if (Object.keys(competences.developpement_pro || {}).length > 1) filled++;

    return Math.min(100, Math.round((filled / total) * 100));
  };

  const progress = calculateProgress();

  // Sections validées par tuteur (stocké dans formData)
  // Structure: { section: { tuteur1_id: timestamp, tuteur2_id: timestamp } }
  const sectionsValidees = formData.sections_validees || {};

  // IDs des tuteurs (depuis les profils chargés)
  const tuteur1Id = tuteurProfiles.tuteur1?.user_id;
  const tuteur2Id = tuteurProfiles.tuteur2?.user_id;

  // Valider/Dévalider une section pour le tuteur connecté
  const toggleValidation = (section: string) => {
    if (!user?.id) return;

    const sectionData = sectionsValidees[section] || {};
    const isCurrentlyValidated = !!sectionData[user.id];

    const newSectionData = { ...sectionData };
    if (isCurrentlyValidated) {
      delete newSectionData[user.id];
    } else {
      newSectionData[user.id] = new Date().toISOString();
    }

    const newValidees = {
      ...sectionsValidees,
      [section]: newSectionData
    };
    updateField('sections_validees', newValidees);

    if (!isCurrentlyValidated) {
      toast.success(`Section "${section}" validée`);
    }
  };

  // Vérifier si un tuteur a validé une section
  const hasValidated = (section: string, odeurId?: string) => {
    if (!odeurId) return false;
    return !!sectionsValidees[section]?.[odeurId];
  };

  // Vérifier si au moins un tuteur a validé (pour l'affichage des onglets)
  const isTabComplete = {
    informations: hasValidated('informations', tuteur1Id) || hasValidated('informations', tuteur2Id),
    modalites: hasValidated('modalites', tuteur1Id) || hasValidated('modalites', tuteur2Id),
    axes: hasValidated('axes', tuteur1Id) || hasValidated('axes', tuteur2Id),
    competences: hasValidated('competences', tuteur1Id) || hasValidated('competences', tuteur2Id),
    synthese: hasValidated('synthese', tuteur1Id) || hasValidated('synthese', tuteur2Id),
  };

  // Vérifier si les deux tuteurs ont validé
  const isSectionFullyValidated = (section: string) => {
    return hasValidated(section, tuteur1Id) && hasValidated(section, tuteur2Id);
  };

  // Composant bouton de validation pour un tuteur
  const ValidationButton = ({
    section,
    odeurId,
    odeurProfile,
    colorClass,
    isCurrentUser
  }: {
    section: string;
    odeurId?: string;
    odeurProfile?: any;
    colorClass: { bg: string; hover: string; border: string; text: string };
    isCurrentUser: boolean;
  }) => {
    const validated = hasValidated(section, odeurId);
    const validationDate = sectionsValidees[section]?.[odeurId || ''];
    const initials = odeurProfile?.display_name?.split(' ').map((n: string) => n[0]).join('') || '?';

    return (
      <button
        onClick={() => isCurrentUser && toggleValidation(section)}
        disabled={!isCurrentUser}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all
          ${validated
            ? `${colorClass.bg} ${colorClass.border} text-white`
            : `bg-gray-100 border-gray-300 text-gray-500`
          }
          ${isCurrentUser ? 'cursor-pointer hover:opacity-90' : 'cursor-default opacity-70'}
        `}
        title={validated
          ? `Validé le ${new Date(validationDate).toLocaleDateString('fr-FR')}`
          : isCurrentUser ? 'Cliquez pour valider' : 'En attente de validation'
        }
      >
        <Avatar className="h-6 w-6">
          {odeurProfile?.avatar_url ? (
            <AvatarImage src={odeurProfile.avatar_url} alt={odeurProfile.display_name} />
          ) : null}
          <AvatarFallback className={validated ? 'bg-white/20 text-white text-xs' : 'bg-gray-200 text-gray-600 text-xs'}>
            {initials}
          </AvatarFallback>
        </Avatar>
        {validated ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
      </button>
    );
  };

  // Composant double validation (les deux tuteurs)
  const DualValidationButtons = ({ section }: { section: string }) => (
    <div className="flex justify-end items-center gap-3">
      <span className="text-sm text-muted-foreground mr-2">Validations :</span>
      <ValidationButton
        section={section}
        odeurId={tuteur1Id}
        odeurProfile={tuteurProfiles.tuteur1}
        colorClass={{
          bg: 'bg-teal-600',
          hover: 'hover:bg-teal-700',
          border: 'border-teal-600',
          text: 'text-teal-700'
        }}
        isCurrentUser={user?.id === tuteur1Id}
      />
      <ValidationButton
        section={section}
        odeurId={tuteur2Id}
        odeurProfile={tuteurProfiles.tuteur2}
        colorClass={{
          bg: 'bg-blue-600',
          hover: 'hover:bg-blue-700',
          border: 'border-blue-600',
          text: 'text-blue-700'
        }}
        isCurrentUser={user?.id === tuteur2Id}
      />
    </div>
  );

  // Générer le style de bordure selon les validations des tuteurs
  const getSectionBorderStyle = (section: string): React.CSSProperties => {
    const t1Validated = hasValidated(section, tuteur1Id);
    const t2Validated = hasValidated(section, tuteur2Id);
    const t1Color = tuteurProfiles.tuteur1?.color || DEFAULT_TUTEUR1_COLOR;
    const t2Color = tuteurProfiles.tuteur2?.color || DEFAULT_TUTEUR2_COLOR;

    if (t1Validated && t2Validated) {
      // Les deux ont validé : dégradé des deux couleurs
      return {
        borderWidth: '3px',
        borderStyle: 'solid',
        borderImage: `linear-gradient(135deg, ${t1Color} 0%, ${t1Color} 50%, ${t2Color} 50%, ${t2Color} 100%) 1`,
        borderRadius: '0.5rem',
      };
    } else if (t1Validated) {
      // Seul tuteur 1 a validé
      return {
        borderWidth: '3px',
        borderStyle: 'solid',
        borderColor: t1Color,
        borderRadius: '0.5rem',
      };
    } else if (t2Validated) {
      // Seul tuteur 2 a validé
      return {
        borderWidth: '3px',
        borderStyle: 'solid',
        borderColor: t2Color,
        borderRadius: '0.5rem',
      };
    }
    // Aucune validation
    return {};
  };

  // Wrapper pour les sections avec bordure colorée
  // Structure DOM constante pour éviter les problèmes de scroll/focus
  const SectionWrapper = ({ section, children }: { section: string; children: React.ReactNode }) => {
    const t1Validated = hasValidated(section, tuteur1Id);
    const t2Validated = hasValidated(section, tuteur2Id);
    const t1Color = tuteurProfiles.tuteur1?.color || DEFAULT_TUTEUR1_COLOR;
    const t2Color = tuteurProfiles.tuteur2?.color || DEFAULT_TUTEUR2_COLOR;

    // Calculer le style de bordure
    let wrapperStyle: React.CSSProperties = {};
    let innerClassName = "space-y-6";

    if (t1Validated && t2Validated) {
      wrapperStyle = {
        background: `linear-gradient(135deg, ${t1Color} 0%, ${t1Color} 50%, ${t2Color} 50%, ${t2Color} 100%)`,
        padding: '4px',
        borderRadius: '0.5rem',
      };
      innerClassName = "space-y-6 bg-background rounded-md p-2";
    } else if (t1Validated || t2Validated) {
      const borderColor = t1Validated ? t1Color : t2Color;
      wrapperStyle = {
        border: `3px solid ${borderColor}`,
        borderRadius: '0.5rem',
        padding: '2px',
      };
    }

    return (
      <div style={wrapperStyle}>
        <div className={innerClassName}>
          {children}
        </div>
      </div>
    );
  };

  // Si mode impression, afficher uniquement le RapportPrintView
  if (showPrintView) {
    return (
      <RapportPrintView
        rapport={formData}
        onClose={() => setShowPrintView(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Rapport {type === 'intermediaire' ? 'Intermédiaire' : 'Final'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {formData.stagiaire_prenom} {formData.stagiaire_nom} - {formData.annee_scolaire || '2025-2026'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Collaboration indicator */}
          <CollaborationIndicator rapportId={rapport?.id} />

          {/* Save status */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isSaving ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                <span>Sauvegarde...</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Sauvegardé</span>
              </>
            ) : null}
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            <Progress value={progress} className="w-24 h-2" />
            <span className="text-sm font-medium">{progress}%</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
            {progress >= 80 && (
              <Button onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full max-w-3xl ${type === 'final' ? 'grid-cols-3' : 'grid-cols-5'}`} tabIndex={-1}>
          <TabsTrigger
            value="informations"
            className={`gap-2 relative ${isTabComplete.informations ? 'bg-blue-100 text-blue-800 data-[state=active]:bg-blue-600 data-[state=active]:text-white' : ''}`}
          >
            {isTabComplete.informations ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Informations
          </TabsTrigger>
          {type === 'intermediaire' && (
            <>
              <TabsTrigger
                value="modalites"
                className={`gap-2 ${isTabComplete.modalites ? 'bg-purple-100 text-purple-800 data-[state=active]:bg-purple-600 data-[state=active]:text-white' : ''}`}
              >
                {isTabComplete.modalites ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <ClipboardList className="h-4 w-4" />
                )}
                Modalités
              </TabsTrigger>
              <TabsTrigger
                value="axes"
                className={`gap-2 ${isTabComplete.axes ? 'bg-orange-100 text-orange-800 data-[state=active]:bg-orange-600 data-[state=active]:text-white' : ''}`}
              >
                {isTabComplete.axes ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Target className="h-4 w-4" />
                )}
                Axes
              </TabsTrigger>
            </>
          )}
          <TabsTrigger
            value="competences"
            className={`gap-2 ${isTabComplete.competences ? 'bg-amber-100 text-amber-800 data-[state=active]:bg-amber-600 data-[state=active]:text-white' : ''}`}
          >
            {isTabComplete.competences ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <GraduationCap className="h-4 w-4" />
            )}
            Compétences
          </TabsTrigger>
          <TabsTrigger
            value="synthese"
            className={`gap-2 ${isTabComplete.synthese ? 'bg-green-100 text-green-800 data-[state=active]:bg-green-600 data-[state=active]:text-white' : ''}`}
          >
            {isTabComplete.synthese ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Synthèse
          </TabsTrigger>
        </TabsList>

        {/* Informations */}
        <TabsContent value="informations" className={`space-y-6 ${activeTab !== 'informations' ? 'hidden' : ''}`} forceMount>
          <SectionWrapper section="informations">
          <Card className="border-2 border-amber-200 bg-amber-50/30 dark:bg-amber-950/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                  <GraduationCap className="h-5 w-5 text-amber-600" />
                </div>
                <CardTitle>Stagiaire</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  value={formData.stagiaire_nom || ''}
                  onChange={(e) => updateField('stagiaire_nom', e.target.value)}
                  placeholder="Nom du stagiaire"
                />
              </div>
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input
                  value={formData.stagiaire_prenom || ''}
                  onChange={(e) => updateField('stagiaire_prenom', e.target.value)}
                  placeholder="Prénom du stagiaire"
                />
              </div>
              <div className="space-y-2">
                <Label>Corps</Label>
                <Input
                  value={formData.stagiaire_corps || 'Certifié'}
                  onChange={(e) => updateField('stagiaire_corps', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Établissement d'exercice</Label>
                <Input
                  value={formData.stagiaire_etablissement || ''}
                  onChange={(e) => updateField('stagiaire_etablissement', e.target.value)}
                  placeholder="Nom de l'établissement"
                />
              </div>
              <div className="space-y-2">
                <Label>Discipline</Label>
                <Input
                  value={formData.stagiaire_discipline || ''}
                  onChange={(e) => updateField('stagiaire_discipline', e.target.value)}
                  placeholder="Mathématiques"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card className="border-2" style={{
              borderColor: tuteurProfiles.tuteur1?.color || DEFAULT_TUTEUR1_COLOR,
              backgroundColor: `${tuteurProfiles.tuteur1?.color || DEFAULT_TUTEUR1_COLOR}15`
            }}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2" style={{ borderColor: tuteurProfiles.tuteur1?.color || DEFAULT_TUTEUR1_COLOR }}>
                    {tuteurProfiles.tuteur1?.avatar_url ? (
                      <AvatarImage src={tuteurProfiles.tuteur1.avatar_url} alt="Tuteur 1" className="object-cover" />
                    ) : null}
                    <AvatarFallback style={{ backgroundColor: tuteurProfiles.tuteur1?.color || DEFAULT_TUTEUR1_COLOR, color: 'white' }}>
                      LM
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle style={{ color: tuteurProfiles.tuteur1?.color || DEFAULT_TUTEUR1_COLOR }}>Tuteur 1</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input
                      value={formData.tuteur1_nom || ''}
                      onChange={(e) => updateField('tuteur1_nom', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input
                      value={formData.tuteur1_prenom || ''}
                      onChange={(e) => updateField('tuteur1_prenom', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Établissement</Label>
                  <Input
                    value={formData.tuteur1_etablissement || ''}
                    onChange={(e) => updateField('tuteur1_etablissement', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discipline</Label>
                  <Input
                    value={formData.tuteur1_discipline || ''}
                    onChange={(e) => updateField('tuteur1_discipline', e.target.value)}
                    placeholder="Mathématiques"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2" style={{
              borderColor: tuteurProfiles.tuteur2?.color || DEFAULT_TUTEUR2_COLOR,
              backgroundColor: `${tuteurProfiles.tuteur2?.color || DEFAULT_TUTEUR2_COLOR}15`
            }}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2" style={{ borderColor: tuteurProfiles.tuteur2?.color || DEFAULT_TUTEUR2_COLOR }}>
                    {tuteurProfiles.tuteur2?.avatar_url ? (
                      <AvatarImage src={tuteurProfiles.tuteur2.avatar_url} alt="Tuteur 2" className="object-cover" />
                    ) : null}
                    <AvatarFallback style={{ backgroundColor: tuteurProfiles.tuteur2?.color || DEFAULT_TUTEUR2_COLOR, color: 'white' }}>
                      BB
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle style={{ color: tuteurProfiles.tuteur2?.color || DEFAULT_TUTEUR2_COLOR }}>Tuteur 2</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input
                      value={formData.tuteur2_nom || ''}
                      onChange={(e) => updateField('tuteur2_nom', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input
                      value={formData.tuteur2_prenom || ''}
                      onChange={(e) => updateField('tuteur2_prenom', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Établissement</Label>
                  <Input
                    value={formData.tuteur2_etablissement || ''}
                    onChange={(e) => updateField('tuteur2_etablissement', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discipline</Label>
                  <Input
                    value={formData.tuteur2_discipline || ''}
                    onChange={(e) => updateField('tuteur2_discipline', e.target.value)}
                    placeholder="Physique-Chimie"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          </SectionWrapper>
          {/* Boutons de validation double (un par tuteur) */}
          <DualValidationButtons section="informations" />
        </TabsContent>

        {/* Modalités (intermédiaire uniquement) */}
        {type === 'intermediaire' && (
          <TabsContent value="modalites" className={`space-y-6 ${activeTab !== 'modalites' ? 'hidden' : ''}`} forceMount>
            <SectionWrapper section="modalites">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Modalités d'accompagnement</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prefillModalites}
                    disabled={isLoadingModalites}
                  >
                    {isLoadingModalites ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    Pré-remplir depuis les séances
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre de visites effectuées par les tuteurs</Label>
                    <Textarea
                      value={formData.modalites?.visites_tuteur || ''}
                      onChange={(e) => updateField('modalites.visites_tuteur', e.target.value)}
                      placeholder="Ex: 4 visites (30/09, 17/11, 18/11 x2)"
                      rows={2}
                    />
                    {/* Dates colorées par tuteur (subtil, sans noms) */}
                    {formData.modalites?.visites_tuteur_dates?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {(formData.modalites.visites_tuteur_dates as Array<{date: string, color: string}>).map((item, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: `${item.color}15`,
                              color: item.color,
                              border: `1px solid ${item.color}40`,
                            }}
                          >
                            {item.date}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre de visites effectuées par le stagiaire</Label>
                    <Textarea
                      value={formData.modalites?.visites_stagiaire || ''}
                      onChange={(e) => updateField('modalites.visites_stagiaire', e.target.value)}
                      placeholder="Ex: 3 observations (15/09, 23/09, 19/11)"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Classes observées par les tuteurs</Label>
                    <Input
                      value={formData.modalites?.classes_observees_tuteur || ''}
                      onChange={(e) => updateField('modalites.classes_observees_tuteur', e.target.value)}
                      placeholder="Ex: 6B, 4B"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Classes observées par le stagiaire</Label>
                    <Input
                      value={formData.modalites?.classes_observees_stagiaire || ''}
                      onChange={(e) => updateField('modalites.classes_observees_stagiaire', e.target.value)}
                      placeholder="Ex: 6ème, 3ème, 6ème demi-groupe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Organisation des plages de concertation</Label>
                  <Textarea
                    value={formData.modalites?.concertations || ''}
                    onChange={(e) => updateField('modalites.concertations', e.target.value)}
                    placeholder="Ex: 8 séances de suivi (~13h30 total) - concertations hebdomadaires"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            </SectionWrapper>
            {/* Boutons de validation double (un par tuteur) */}
            <DualValidationButtons section="modalites" />
          </TabsContent>
        )}

        {/* Axes (intermédiaire uniquement) */}
        {type === 'intermediaire' && (
          <TabsContent value="axes" className={`space-y-6 ${activeTab !== 'axes' ? 'hidden' : ''}`} forceMount>
            <SectionWrapper section="axes">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Axes thématiques de formation :</strong> Identifier et expliciter les axes thématiques
                qui ont été prioritairement travaillés avec le stagiaire sur cette période
                (gestion de classe, communication, élaboration de séquences, activité des élèves, posture professionnelle...).
              </p>
            </div>

            {[0, 1, 2, 3].map((index) => (
              <AxeSection
                key={index}
                index={index}
                axe={formData.axes?.[index] || defaultAxes[index]}
                onChange={(field, value) => updateAxe(index, field, value)}
                tuteurProfile={index < 2 ? tuteurProfiles.tuteur1 : tuteurProfiles.tuteur2}
              />
            ))}

            </SectionWrapper>
            {/* Boutons de validation double (un par tuteur) */}
            <DualValidationButtons section="axes" />
          </TabsContent>
        )}

        {/* Compétences */}
        <TabsContent value="competences" className={`space-y-6 ${activeTab !== 'competences' ? 'hidden' : ''}`} forceMount>
          <SectionWrapper section="competences">
          {type === 'intermediaire' ? (
            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800 mb-6">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <strong>Légende :</strong><br />
                • <strong>À entretenir</strong> : compétence maîtrisée<br />
                • <strong>À travailler encore</strong> : compétence travaillée mais pas suffisamment construite<br />
                • <strong>À investir</strong> : compétence qui n'a pas encore fait l'objet d'un travail spécifique
              </p>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800 mb-6">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Évaluation finale des compétences :</strong><br />
                • <strong>Suffisant</strong> : la compétence est acquise de manière satisfaisante<br />
                • <strong>Insuffisant</strong> : la compétence n'est pas suffisamment développée<br />
                • <strong>Non observé</strong> : la compétence n'a pas pu être évaluée
              </p>
            </div>
          )}

          <CompetenceGrid
            competences={formData.competences || {}}
            onChange={updateCompetence}
            rapportType={type}
            currentUserId={user?.id}
            tuteurProfiles={tuteurProfiles}
          />

          </SectionWrapper>
          {/* Boutons de validation double (un par tuteur) */}
          <DualValidationButtons section="competences" />
        </TabsContent>

        {/* Synthèse */}
        <TabsContent value="synthese" className={`space-y-6 ${activeTab !== 'synthese' ? 'hidden' : ''}`} forceMount>
          <SectionWrapper section="synthese">
          {/* Section différente selon le type de rapport */}
          {type === 'intermediaire' ? (
            <Card>
              <CardHeader>
                <CardTitle>Axes de travail pour la fin de l'année</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Compétences qu'il est nécessaire de conforter</Label>
                  <Textarea
                    value={formData.axes_fin_annee?.a_conforter || ''}
                    onChange={(e) => updateField('axes_fin_annee.a_conforter', e.target.value)}
                    placeholder="• Gestion du rythme et dynamisme des séances&#10;• Communication à la classe entière&#10;• ..."
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nouvelles compétences à travailler</Label>
                  <Textarea
                    value={formData.axes_fin_annee?.a_travailler || ''}
                    onChange={(e) => updateField('axes_fin_annee.a_travailler', e.target.value)}
                    placeholder="• Différenciation pédagogique&#10;• Intégration de problèmes ouverts&#10;• ..."
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Synthèse du parcours de formation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Cette synthèse reprend les éléments clés du parcours de formation du stagiaire durant l'année.
                    Elle sera transmise au jury via la plateforme COMPAS.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Synthèse globale</Label>
                  <Textarea
                    value={formData.synthese?.contenu || ''}
                    onChange={(e) => updateField('synthese.contenu', e.target.value)}
                    placeholder="Rédigez ici la synthèse du parcours de formation du stagiaire...&#10;&#10;Points forts observés :&#10;- ...&#10;&#10;Évolution au cours de l'année :&#10;- ...&#10;&#10;Conclusion :&#10;..."
                    rows={12}
                    className="min-h-[300px]"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Signatures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-4 p-4 border rounded-lg">
                  <Label>Tuteur 1 ({formData.tuteur1_prenom} {formData.tuteur1_nom})</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!formData.signature_tuteur1_date}
                      onCheckedChange={(checked) =>
                        updateField('signature_tuteur1_date', checked ? new Date().toISOString() : null)
                      }
                    />
                    <span className="text-sm">
                      {formData.signature_tuteur1_date ? 'Signé' : 'Non signé'}
                    </span>
                  </div>
                  {formData.signature_tuteur1_date && (
                    <p className="text-xs text-muted-foreground">
                      Le {new Date(formData.signature_tuteur1_date).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                  <Label>Tuteur 2 ({formData.tuteur2_prenom} {formData.tuteur2_nom})</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!formData.signature_tuteur2_date}
                      onCheckedChange={(checked) =>
                        updateField('signature_tuteur2_date', checked ? new Date().toISOString() : null)
                      }
                    />
                    <span className="text-sm">
                      {formData.signature_tuteur2_date ? 'Signé' : 'Non signé'}
                    </span>
                  </div>
                  {formData.signature_tuteur2_date && (
                    <p className="text-xs text-muted-foreground">
                      Le {new Date(formData.signature_tuteur2_date).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                  <Label>Stagiaire ({formData.stagiaire_prenom} {formData.stagiaire_nom})</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!formData.signature_stagiaire_date}
                      disabled
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.signature_stagiaire_date ? 'Signé' : 'En attente'}
                    </span>
                  </div>
                  {formData.signature_stagiaire_date && (
                    <p className="text-xs text-muted-foreground">
                      Le {new Date(formData.signature_stagiaire_date).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partage avec stagiaire */}
          <Card className="border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Share2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Partager avec le stagiaire</h3>
                    <p className="text-sm text-muted-foreground">
                      Une fois partagé, le stagiaire pourra consulter ce rapport
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {formData.shared_with_stagiaire ? (
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Partagé
                    </Badge>
                  ) : (
                    <Button onClick={handleShare} disabled={progress < 80}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Partager maintenant
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          </SectionWrapper>
          {/* Boutons de validation double (un par tuteur) */}
          <DualValidationButtons section="synthese" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
