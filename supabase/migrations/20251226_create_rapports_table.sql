-- Migration: Create rapports table for intermediate and final reports
-- Date: 2025-12-26

-- Create the rapports table
CREATE TABLE IF NOT EXISTS public.rapports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Type de rapport
    type VARCHAR(20) NOT NULL CHECK (type IN ('intermediaire', 'final')),

    -- Année scolaire
    annee_scolaire VARCHAR(10) NOT NULL DEFAULT '2025-2026',

    -- Statut du rapport
    status VARCHAR(20) NOT NULL DEFAULT 'brouillon' CHECK (status IN ('brouillon', 'en_cours', 'complet', 'partage')),

    -- Relations
    stagiaire_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    tuteur1_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    tuteur2_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,

    -- Informations stagiaire (cache pour éviter les joins)
    stagiaire_nom VARCHAR(100),
    stagiaire_prenom VARCHAR(100),
    stagiaire_corps VARCHAR(50) DEFAULT 'Certifié',
    stagiaire_etablissement VARCHAR(200),
    stagiaire_discipline VARCHAR(100) DEFAULT 'Mathématiques',

    -- Informations tuteur 1
    tuteur1_nom VARCHAR(100),
    tuteur1_prenom VARCHAR(100),
    tuteur1_etablissement VARCHAR(200),
    tuteur1_discipline VARCHAR(100) DEFAULT 'Mathématiques',

    -- Informations tuteur 2
    tuteur2_nom VARCHAR(100),
    tuteur2_prenom VARCHAR(100),
    tuteur2_etablissement VARCHAR(200),
    tuteur2_discipline VARCHAR(100) DEFAULT 'Mathématiques',

    -- Modalités d'accompagnement (JSONB)
    modalites JSONB DEFAULT '{
        "visites_tuteur": "",
        "visites_stagiaire": "",
        "classes_observees_tuteur": "",
        "classes_observees_stagiaire": "",
        "concertations": ""
    }'::jsonb,

    -- Axes thématiques (JSONB - 4 axes)
    axes JSONB DEFAULT '[
        {
            "titre": "",
            "constat_depart": "",
            "evolution": "",
            "etat_actuel": "",
            "competences": ""
        },
        {
            "titre": "",
            "constat_depart": "",
            "evolution": "",
            "etat_actuel": "",
            "competences": ""
        },
        {
            "titre": "",
            "constat_depart": "",
            "evolution": "",
            "etat_actuel": "",
            "competences": ""
        },
        {
            "titre": "",
            "constat_depart": "",
            "evolution": "",
            "etat_actuel": "",
            "competences": ""
        }
    ]'::jsonb,

    -- Grille de compétences (JSONB)
    competences JSONB DEFAULT '{
        "reglementaires": {
            "principes_egalite": "",
            "ponctualite": "",
            "positionnement_adulte": "",
            "respect_eleves": "",
            "reglement_interieur": "",
            "commentaire": ""
        },
        "relationnelles": {
            "langage_clair": "",
            "travail_equipe": "",
            "ecoute_echanges": "",
            "participation_instances": "",
            "communication_familles": "",
            "commentaire": ""
        },
        "disciplinaires": {
            "maitrise_contenus": "",
            "transpositions_didactiques": "",
            "identification_savoirs": "",
            "commentaire": ""
        },
        "pedagogiques": {
            "encadrement_groupe": "",
            "climat_serein": "",
            "encourage_valorise": "",
            "objectifs_sens": "",
            "diversite_eleves": "",
            "preparation_sequences": "",
            "outils_evaluation": "",
            "suivi_travail": "",
            "regulation_pratique": "",
            "commentaire": ""
        },
        "numeriques": {
            "utilisation_outils": "",
            "distinction_usages": "",
            "attention_eleves": "",
            "commentaire": ""
        },
        "developpement_pro": {
            "prise_compte_conseils": "",
            "analyse_reflexive": "",
            "commentaire": ""
        }
    }'::jsonb,

    -- Axes de travail fin d'année (JSONB)
    axes_fin_annee JSONB DEFAULT '{
        "a_conforter": "",
        "a_travailler": ""
    }'::jsonb,

    -- Signatures
    signature_tuteur1_date TIMESTAMP WITH TIME ZONE,
    signature_tuteur2_date TIMESTAMP WITH TIME ZONE,
    signature_stagiaire_date TIMESTAMP WITH TIME ZONE,

    -- Partage avec stagiaire
    shared_with_stagiaire BOOLEAN DEFAULT false,
    shared_at TIMESTAMP WITH TIME ZONE,

    -- Dernière modification par
    last_modified_by UUID REFERENCES public.profiles(user_id),

    -- Contrainte d'unicité : un seul rapport par type/année/stagiaire
    UNIQUE(type, annee_scolaire, stagiaire_id)
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_rapports_tuteur1 ON public.rapports(tuteur1_id);
CREATE INDEX IF NOT EXISTS idx_rapports_tuteur2 ON public.rapports(tuteur2_id);
CREATE INDEX IF NOT EXISTS idx_rapports_stagiaire ON public.rapports(stagiaire_id);
CREATE INDEX IF NOT EXISTS idx_rapports_type ON public.rapports(type);
CREATE INDEX IF NOT EXISTS idx_rapports_status ON public.rapports(status);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_rapports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_rapports_updated_at ON public.rapports;
CREATE TRIGGER trigger_rapports_updated_at
    BEFORE UPDATE ON public.rapports
    FOR EACH ROW
    EXECUTE FUNCTION update_rapports_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.rapports ENABLE ROW LEVEL SECURITY;

-- Policy: Les tuteurs peuvent voir et modifier leurs rapports
CREATE POLICY "Tuteurs peuvent gérer leurs rapports" ON public.rapports
    FOR ALL
    USING (
        auth.uid() = tuteur1_id
        OR auth.uid() = tuteur2_id
    )
    WITH CHECK (
        auth.uid() = tuteur1_id
        OR auth.uid() = tuteur2_id
    );

-- Policy: Les stagiaires peuvent voir leurs rapports partagés
CREATE POLICY "Stagiaires peuvent voir rapports partagés" ON public.rapports
    FOR SELECT
    USING (
        auth.uid() = stagiaire_id
        AND shared_with_stagiaire = true
    );

-- Realtime: Activer pour la collaboration temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE public.rapports;

-- Commentaire sur la table
COMMENT ON TABLE public.rapports IS 'Table des rapports intermédiaires et finaux pour le suivi des stagiaires';
