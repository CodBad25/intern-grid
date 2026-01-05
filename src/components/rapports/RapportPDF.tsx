import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  italic: {
    fontStyle: 'italic',
    fontSize: 8,
  },
  // Tableaux
  table: {
    width: '100%',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    border: '1pt solid black',
    padding: 4,
  },
  tableCellHeader: {
    border: '1pt solid black',
    padding: 4,
    backgroundColor: '#e5e7eb',
    fontWeight: 'bold',
  },
  tableCellLight: {
    border: '1pt solid black',
    padding: 4,
    backgroundColor: '#f9fafb',
  },
  // Page avec marges réduites pour axes 2, 3, 4
  pageAxes: {
    padding: 15,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  // Tableaux compacts pour axes 2, 3, 4 (10pt)
  axeTable: {
    width: '100%',
    marginBottom: 4,
  },
  axeCell: {
    border: '0.5pt solid black',
    padding: 2,
    fontSize: 10,
  },
  axeCellHeader: {
    border: '0.5pt solid black',
    padding: 2,
    backgroundColor: '#e5e7eb',
    fontWeight: 'bold',
    fontSize: 10,
  },
  // Grid 3 colonnes
  grid3: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  gridCol: {
    flex: 1,
  },
  // Section
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  // Compétences
  competenceHeader: {
    flexDirection: 'row',
  },
  competenceLabel: {
    flex: 1,
    border: '1pt solid black',
    padding: 3,
    backgroundColor: '#e5e7eb',
    fontWeight: 'bold',
    fontSize: 8,
  },
  competenceCol: {
    width: 50,
    border: '1pt solid black',
    padding: 3,
    backgroundColor: '#e5e7eb',
    textAlign: 'center',
    fontSize: 7,
    fontWeight: 'bold',
  },
  competenceSubtitle: {
    border: '1pt solid black',
    padding: 3,
    backgroundColor: '#f3f4f6',
    fontSize: 7,
    fontStyle: 'italic',
  },
  competenceRow: {
    flexDirection: 'row',
  },
  competenceItem: {
    flex: 1,
    border: '1pt solid black',
    padding: 3,
    fontSize: 8,
  },
  competenceCheck: {
    width: 50,
    border: '1pt solid black',
    padding: 3,
    textAlign: 'center',
    fontSize: 10,
  },
  commentSection: {
    border: '1pt solid black',
    padding: 4,
    backgroundColor: '#f9fafb',
  },
  commentLabel: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  // Signatures
  signatureTable: {
    flexDirection: 'row',
    marginTop: 20,
  },
  signatureCell: {
    flex: 1,
    border: '1pt solid black',
    padding: 8,
    minHeight: 60,
  },
});

// Structure des compétences
const competencesOfficiel = [
  {
    section: 'Compétences relatives à la prise en compte des éléments réglementaires et institutionnels de son environnement professionnel en lien avec les responsabilités attachées à sa fonction',
    subtitle: 'CC1. Faire partager les valeurs de la République\nCC2. Inscrire son action dans le cadre des principes fondamentaux du système éducatif et dans le cadre réglementaire de l\'école\nCC6. Agir en éducateur responsable et selon des principes éthiques',
    categoryId: 'reglementaires',
    items: [
      { id: 'principes_egalite', label: 'Respecte et fait respecter les principes d\'égalité, de neutralité, de laïcité, d\'équité et de tolérance' },
      { id: 'ponctualite', label: 'Répond aux exigences de ponctualité, d\'assiduité, de sécurité et de confidentialité' },
      { id: 'positionnement_adulte', label: 'Adopte une attitude et un positionnement d\'adulte responsable dans la classe et dans l\'établissement' },
      { id: 'respect_eleves', label: 'Fait preuve de respect à l\'égard des élèves et des membres de la communauté éducative' },
      { id: 'reglement_interieur', label: 'Fait respecter le règlement intérieur' },
    ],
  },
  {
    section: 'Compétences relationnelles, de communication et d\'animation favorisant la transmission, l\'implication et la coopération au sein de la communauté éducative et de son environnement',
    subtitle: 'CC7. Maîtriser la langue française à des fins de communication\nCC10. Coopérer au sein d\'une équipe\nCC11. Contribuer à l\'action de la communauté éducative\nCC12. Coopérer avec les parents d\'élèves\nCC13. Coopérer avec les partenaires de l\'école',
    categoryId: 'relationnelles',
    items: [
      { id: 'langage_clair', label: 'Utilise un langage clair et adapté à son ou ses interlocuteurs' },
      { id: 'travail_equipe', label: 'Participe à sa mesure au travail d\'équipe mis en œuvre par/dans l\'établissement' },
      { id: 'ecoute_echanges', label: 'Adopte une attitude favorable à l\'écoute et aux échanges avec les différents membres de la communauté éducative dont les parents d\'élèves' },
      { id: 'participation_instances', label: 'Participe aux différentes instances et conseils' },
      { id: 'communication_familles', label: 'Communique autant que de besoin avec les familles' },
    ],
  },
  {
    section: 'Compétences liées à la maîtrise des contenus disciplinaires et à leur didactique',
    subtitle: 'P1. Maîtriser les savoirs disciplinaires et leur didactique\nP2. Maîtriser la langue française dans le cadre de son enseignement',
    categoryId: 'disciplinaires',
    items: [
      { id: 'maitrise_contenus', label: 'Maîtrise les contenus disciplinaires et les concepts clés nécessaires à son enseignement' },
      { id: 'transpositions_didactiques', label: 'Met en œuvre les transpositions didactiques appropriées' },
      { id: 'identification_savoirs', label: 'Identifie les savoirs et savoir-faire à acquérir par les élèves en lien avec les programmes et référentiels' },
    ],
  },
  {
    section: 'Compétences éducatives et pédagogiques nécessaires à la mise en œuvre de situations d\'apprentissage et d\'accompagnement des élèves diverses',
    subtitle: 'P3. Construire, mettre en œuvre et animer des situations d\'enseignement et d\'apprentissage prenant en compte la diversité des élèves\nP4. Organiser et assurer un mode de fonctionnement du groupe favorisant l\'apprentissage et la socialisation des élèves\nP5. Évaluer les progrès et acquisitions des élèves\nCC3. Connaître les élèves et les processus d\'apprentissage\nCC4. Prendre en compte la diversité des élèves\nCC5. Accompagner les élèves dans leur parcours de formation',
    categoryId: 'pedagogiques',
    items: [
      { id: 'encadrement_groupe', label: 'Encadre les élèves et le groupe classe, fait preuve de vigilance à l\'égard des comportements des élèves et fait preuve d\'autorité' },
      { id: 'climat_serein', label: 'Instaure un climat serein et de confiance au sein de la classe' },
      { id: 'encourage_valorise', label: 'Encourage et valorise ses élèves' },
      { id: 'objectifs_sens', label: 'Fixe les objectifs à atteindre, les moyens d\'y parvenir et donne du sens aux apprentissages' },
      { id: 'diversite_eleves', label: 'Prend en compte la diversité des élèves et s\'assure de l\'adéquation entre les propositions pédagogiques et le niveau des élèves' },
      { id: 'preparation_sequences', label: 'Prépare en amont les séquences pédagogiques et les inscrit dans une progression réfléchie' },
      { id: 'outils_evaluation', label: 'Met en place les outils et supports d\'évaluation en ciblant les compétences à évaluer' },
      { id: 'suivi_travail', label: 'Prend en charge le suivi du travail personnel des élèves' },
      { id: 'regulation_pratique', label: 'S\'appuie sur les évaluations pour réguler sa pratique et les apprentissages' },
    ],
  },
  {
    section: 'Compétences relatives à l\'usage et à la maîtrise des technologies de l\'information et de la communication',
    subtitle: 'CC9. Intégrer les éléments de la culture numérique nécessaires à l\'exercice de son métier',
    categoryId: 'numeriques',
    items: [
      { id: 'utilisation_outils', label: 'Utilise les outils numériques et les réseaux mis en place dans l\'établissement' },
      { id: 'distinction_usages', label: 'Distingue les usages personnels et professionnels dans sa pratique' },
      { id: 'attention_eleves', label: 'Est attentif à la manière dont les élèves mobilisent l\'outil numérique' },
    ],
  },
  {
    section: 'Compétences d\'analyse et d\'adaptation de sa pratique professionnelle en tenant compte des évolutions du métier et de son environnement de travail',
    subtitle: 'CC14. S\'engager dans une démarche individuelle et collective de développement professionnel',
    categoryId: 'developpement_pro',
    items: [
      { id: 'prise_compte_conseils', label: 'Prend en compte les conseils prodigués et s\'efforce d\'améliorer sa pratique' },
      { id: 'analyse_reflexive', label: 'Est capable de prendre du recul et de porter une analyse réflexive sur sa pratique' },
    ],
  },
];

interface RapportPDFProps {
  rapport: any;
}

// Fonction pour obtenir la valeur d'une compétence
const getCompetenceValue = (rapport: any, categoryId: string, itemId: string): string | null => {
  const categoryData = rapport.competences?.[categoryId];
  if (!categoryData) return null;

  const itemData = categoryData[itemId];
  if (!itemData) return null;

  if (typeof itemData === 'object' && itemData.tuteur1 && itemData.tuteur2) {
    if (itemData.tuteur1 === itemData.tuteur2) {
      return itemData.tuteur1;
    }
    return `${itemData.tuteur1}/${itemData.tuteur2}`;
  }

  if (typeof itemData === 'string') {
    return itemData;
  }

  return null;
};

// Composant Table Info
const InfoTable = ({ title, rows }: { title: string; rows: { label: string; value: string }[] }) => (
  <View style={styles.table}>
    <View style={styles.tableRow}>
      <View style={[styles.tableCellHeader, { width: '100%' }]}>
        <Text>{title}</Text>
      </View>
    </View>
    {rows.map((row, i) => (
      <View key={i} style={styles.tableRow}>
        <View style={[styles.tableCell, { width: '100%' }]}>
          <Text>{row.label} : {row.value || ''}</Text>
        </View>
      </View>
    ))}
  </View>
);

// Composant Axe (compact = true pour faire tenir 3 axes sur une page)
const AxeTable = ({ index, axe, compact = false }: { index: number; axe: any; compact?: boolean }) => {
  const tableStyle = compact ? styles.axeTable : styles.table;
  const cellStyle = compact ? styles.axeCell : styles.tableCell;
  const headerStyle = compact ? styles.axeCellHeader : styles.tableCellHeader;

  return (
    <View style={tableStyle} wrap={false}>
      <View style={styles.tableRow}>
        <View style={[headerStyle, { width: '100%' }]}>
          <Text>Axe {index + 1} de formation travaillé avec la stagiaire ou le stagiaire</Text>
        </View>
      </View>
      <View style={styles.tableRow}>
        <View style={[cellStyle, { width: '100%' }]}>
          <Text>{axe?.titre || ''}</Text>
        </View>
      </View>
      <View style={styles.tableRow}>
        <View style={[headerStyle, { width: '100%' }]}>
          <Text>Constat de départ</Text>
        </View>
      </View>
      <View style={styles.tableRow}>
        <View style={[cellStyle, { width: '100%' }]}>
          <Text>{axe?.constat_depart || ''}</Text>
        </View>
      </View>
      <View style={styles.tableRow}>
        <View style={[headerStyle, { width: '100%' }]}>
          <Text>Évolution constatée</Text>
        </View>
      </View>
      <View style={styles.tableRow}>
        <View style={[cellStyle, { width: '100%' }]}>
          <Text>{axe?.evolution || ''}</Text>
        </View>
      </View>
      <View style={styles.tableRow}>
        <View style={[headerStyle, { width: '100%' }]}>
          <Text>État des lieux à ce jour</Text>
        </View>
      </View>
      <View style={styles.tableRow}>
        <View style={[cellStyle, { width: '100%' }]}>
          <Text>{axe?.etat_actuel || ''}</Text>
        </View>
      </View>
      <View style={styles.tableRow}>
        <View style={[headerStyle, { width: '100%' }]}>
          <Text>Compétences professionnelles du référentiel associées</Text>
        </View>
      </View>
      <View style={styles.tableRow}>
        <View style={[cellStyle, { width: '100%' }]}>
          <Text>{axe?.competences || ''}</Text>
        </View>
      </View>
    </View>
  );
};

// Composant Section Compétences
const CompetenceSection = ({ section, rapport }: { section: typeof competencesOfficiel[0]; rapport: any }) => {
  const commentaire = rapport.competences?.[section.categoryId]?.commentaire || '';

  return (
    <View style={styles.table} wrap={false}>
      {/* Header */}
      <View style={styles.competenceHeader}>
        <View style={styles.competenceLabel}>
          <Text>{section.section}</Text>
        </View>
        <View style={styles.competenceCol}>
          <Text>à entretenir</Text>
        </View>
        <View style={styles.competenceCol}>
          <Text>à travailler encore</Text>
        </View>
        <View style={styles.competenceCol}>
          <Text>à investir</Text>
        </View>
      </View>
      {/* Subtitle */}
      <View style={styles.tableRow}>
        <View style={[styles.competenceSubtitle, { width: '100%' }]}>
          <Text>{section.subtitle}</Text>
        </View>
      </View>
      {/* Items */}
      {section.items.map((item) => {
        const value = getCompetenceValue(rapport, section.categoryId, item.id);
        const isEntretenir = value === 'entretenir' || value === 'suffisant';
        const isTravailler = value === 'travailler' || value?.includes('travailler');
        const isInvestir = value === 'investir' || value === 'insuffisant' || value === 'non_observe';

        return (
          <View key={item.id} style={styles.competenceRow}>
            <View style={styles.competenceItem}>
              <Text>{item.label}</Text>
            </View>
            <View style={styles.competenceCheck}>
              <Text>{isEntretenir ? 'X' : ''}</Text>
            </View>
            <View style={styles.competenceCheck}>
              <Text>{isTravailler ? 'X' : ''}</Text>
            </View>
            <View style={styles.competenceCheck}>
              <Text>{isInvestir ? 'X' : ''}</Text>
            </View>
          </View>
        );
      })}
      {/* Commentaires */}
      <View style={styles.commentSection}>
        <Text style={styles.commentLabel}>Commentaires :</Text>
        <Text>{commentaire}</Text>
      </View>
    </View>
  );
};

export const RapportPDF = ({ rapport }: RapportPDFProps) => (
  <Document>
    {/* Page 1 : En-tête + Infos + Modalités + Axe 1 */}
    <Page size="A4" style={styles.page}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>Rapport intermédiaire {rapport.annee_scolaire || '2025-2026'}</Text>
        <Text style={styles.subtitle}>DU TUTEUR ÉTABLISSEMENT D'UN PROFESSEUR STAGIAIRE</Text>
        <Text style={styles.italic}>
          À transmettre par voie électronique à l'inspection pédagogique de la discipline avant le 17 janvier 2026
          avec copie au chef d'établissement du professeur stagiaire.
        </Text>
      </View>

      {/* Tableaux Stagiaire + Tuteurs */}
      <View style={styles.grid3}>
        <View style={styles.gridCol}>
          <InfoTable
            title="STAGIAIRE :"
            rows={[
              { label: 'Nom', value: rapport.stagiaire_nom },
              { label: 'Prénom', value: rapport.stagiaire_prenom },
              { label: 'Corps', value: rapport.stagiaire_corps },
              { label: 'Établissement', value: rapport.stagiaire_etablissement },
              { label: 'Discipline', value: rapport.stagiaire_discipline },
            ]}
          />
        </View>
        <View style={styles.gridCol}>
          <InfoTable
            title="TUTEUR/TUTRICE 1 :"
            rows={[
              { label: 'Nom', value: rapport.tuteur1_nom },
              { label: 'Prénom', value: rapport.tuteur1_prenom },
              { label: 'Établissement', value: rapport.tuteur1_etablissement },
              { label: 'Discipline', value: rapport.tuteur1_discipline },
            ]}
          />
        </View>
        <View style={styles.gridCol}>
          <InfoTable
            title="TUTEUR/TUTRICE 2 :"
            rows={[
              { label: 'Nom', value: rapport.tuteur2_nom },
              { label: 'Prénom', value: rapport.tuteur2_prenom },
              { label: 'Établissement', value: rapport.tuteur2_etablissement },
              { label: 'Discipline', value: rapport.tuteur2_discipline },
            ]}
          />
        </View>
      </View>

      {/* Modalités */}
      <View style={styles.table}>
        <Text style={styles.sectionTitle}>Modalités d'accompagnement</Text>
        {[
          { label: 'Nombre de visites effectuées par la tutrice ou le tuteur', value: rapport.modalites?.visites_tuteur },
          { label: 'Nombre de visites effectuées par la stagiaire ou le stagiaire', value: rapport.modalites?.visites_stagiaire },
          { label: 'Classes observées par la tutrice ou le tuteur', value: rapport.modalites?.classes_observees_tuteur },
          { label: 'Classes observées par la stagiaire ou le stagiaire', value: rapport.modalites?.classes_observees_stagiaire },
          { label: 'Organisation des plages de concertation', value: rapport.modalites?.concertations },
        ].map((row, i) => (
          <View key={i} style={styles.tableRow}>
            <View style={[styles.tableCell, { width: '60%' }]}>
              <Text>{row.label}</Text>
            </View>
            <View style={[styles.tableCell, { width: '40%' }]}>
              <Text>{row.value || ''}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Axes thématiques - Titre */}
      <Text style={styles.sectionTitle}>Axes thématiques de formation du premier semestre</Text>
      <Text style={styles.italic}>
        Identifier et expliciter les axes thématiques de formation qui ont été prioritairement travaillés
        avec la stagiaire ou le stagiaire sur cette première période.
      </Text>

      {/* Axe 1 */}
      <AxeTable index={0} axe={rapport.axes?.[0]} />
    </Page>

    {/* Page 2 : Axes 2, 3 et 4 (10pt, marges réduites) */}
    <Page size="A4" style={styles.pageAxes}>
      <AxeTable index={1} axe={rapport.axes?.[1]} compact />
      <AxeTable index={2} axe={rapport.axes?.[2]} compact />
      <AxeTable index={3} axe={rapport.axes?.[3]} compact />
    </Page>

    {/* Page 3 : Compétences 1-3 */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Synthèse pour la professeure ou le professeur stagiaire</Text>
      <Text style={[styles.italic, { marginBottom: 8 }]}>
        à entretenir : compétence maîtrisée | à travailler encore : compétence travaillée mais pas suffisamment construite | à investir : compétence qui n'a pas encore fait l'objet d'un travail spécifique
      </Text>

      <CompetenceSection section={competencesOfficiel[0]} rapport={rapport} />
      <CompetenceSection section={competencesOfficiel[1]} rapport={rapport} />
      <CompetenceSection section={competencesOfficiel[2]} rapport={rapport} />
    </Page>

    {/* Page 4 : Compétences 4-6 */}
    <Page size="A4" style={styles.page}>
      <CompetenceSection section={competencesOfficiel[3]} rapport={rapport} />
      <CompetenceSection section={competencesOfficiel[4]} rapport={rapport} />
      <CompetenceSection section={competencesOfficiel[5]} rapport={rapport} />

      <Text style={styles.italic}>
        Se rapporter au référentiel de compétences dans lequel chaque compétence est accompagnée d'items
        qui en détaillent les composantes et en précisent le champ. BO n°30 du 25 juillet 2013
      </Text>
    </Page>

    {/* Page 5 : Axes fin d'année + Signatures */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Axes de travail pour la fin de l'année</Text>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={[styles.tableCellHeader, { width: '100%' }]}>
            <Text>Compétences qu'il est nécessaire de conforter</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={[styles.tableCell, { width: '100%', minHeight: 40 }]}>
            <Text>{rapport.axes_fin_annee?.a_conforter || ''}</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={[styles.tableCellHeader, { width: '100%' }]}>
            <Text>Nouvelles compétences à travailler</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={[styles.tableCell, { width: '100%', minHeight: 40 }]}>
            <Text>{rapport.axes_fin_annee?.a_travailler || ''}</Text>
          </View>
        </View>
      </View>

      {/* Signatures */}
      <View style={styles.signatureTable}>
        <View style={styles.signatureCell}>
          <Text>Date : {rapport.signature_tuteur1_date ? new Date(rapport.signature_tuteur1_date).toLocaleDateString('fr-FR') : ''}</Text>
          <Text style={{ marginTop: 10 }}>Signature du ou des tuteurs :</Text>
        </View>
        <View style={styles.signatureCell}>
          <Text>Date : {rapport.signature_stagiaire_date ? new Date(rapport.signature_stagiaire_date).toLocaleDateString('fr-FR') : ''}</Text>
          <Text style={{ marginTop: 10 }}>Signature de la stagiaire ou du stagiaire :</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default RapportPDF;
