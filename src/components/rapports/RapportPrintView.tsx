import React from 'react';

interface RapportPrintViewProps {
  rapport: any;
  onClose: () => void;
}

// Structure exacte du document officiel
const competencesOfficiel = [
  {
    section: 'Compétences relatives à la prise en compte des éléments réglementaires et institutionnels de son environnement professionnel en lien avec les responsabilités attachées à sa fonction',
    subtitle: 'CC1. Faire partager les valeurs de la République\nCC2. Inscrire son action dans le cadre des principes fondamentaux du système éducatif et dans le cadre réglementaire de l\'école\nCC6. Agir en éducateur responsable et selon des principes éthiques',
    items: [
      'Respecte et fait respecter les principes d\'égalité, de neutralité, de laïcité, d\'équité et de tolérance',
      'Répond aux exigences de ponctualité, d\'assiduité, de sécurité et de confidentialité',
      'Adopte une attitude et un positionnement d\'adulte responsable dans la classe et dans l\'établissement',
      'Fait preuve de respect à l\'égard des élèves et des membres de la communauté éducative',
      'Fait respecter le règlement intérieur',
    ],
    hasComment: true,
  },
  {
    section: 'Compétences relationnelles, de communication et d\'animation favorisant la transmission, l\'implication et la coopération au sein de la communauté éducative et de son environnement',
    subtitle: 'CC7. Maîtriser la langue française à des fins de communication\nCC10. Coopérer au sein d\'une équipe\nCC11. Contribuer à l\'action de la communauté éducative\nCC12. Coopérer avec les parents d\'élèves\nCC13. Coopérer avec les partenaires de l\'école',
    items: [
      'Utilise un langage clair et adapté à son ou ses interlocuteurs',
      'Participe à sa mesure au travail d\'équipe mis en œuvre par/dans l\'établissement',
      'Adopte une attitude favorable à l\'écoute et aux échanges avec les différents membres de la communauté éducative dont les parents d\'élèves',
      'Participe aux différentes instances et conseils',
      'Communique autant que de besoin avec les familles',
    ],
    hasComment: true,
  },
  {
    section: 'Compétences liées à la maîtrise des contenus disciplinaires et à leur didactique',
    subtitle: 'P1. Maîtriser les savoirs disciplinaires et leur didactique\nP2. Maîtriser la langue française dans le cadre de son enseignement',
    items: [
      'Maîtrise les contenus disciplinaires et les concepts clés nécessaires à son enseignement',
      'Met en œuvre les transpositions didactiques appropriées',
      'Identifie les savoirs et savoir-faire à acquérir par les élèves en lien avec les programmes et référentiels',
    ],
    hasComment: true,
  },
  {
    section: 'Compétences éducatives et pédagogiques nécessaires à la mise en œuvre de situations d\'apprentissage et d\'accompagnement des élèves diverses',
    subtitle: 'P3. Construire, mettre en œuvre et animer des situations d\'enseignement et d\'apprentissage prenant en compte la diversité des élèves\nP4. Organiser et assurer un mode de fonctionnement du groupe favorisant l\'apprentissage et la socialisation des élèves\nP5. Évaluer les progrès et acquisitions des élèves\nCC3. Connaître les élèves et les processus d\'apprentissage\nCC4. Prendre en compte la diversité des élèves\nCC5. Accompagner les élèves dans leur parcours de formation',
    items: [
      'Encadre les élèves et le groupe classe, fait preuve de vigilance à l\'égard des comportements des élèves et fait preuve d\'autorité',
      'Instaure un climat serein et de confiance au sein de la classe',
      'Encourage et valorise ses élèves',
      'Fixe les objectifs à atteindre, les moyens d\'y parvenir et donne du sens aux apprentissages',
      'Prend en compte la diversité des élèves et s\'assure de l\'adéquation entre les propositions pédagogiques et le niveau des élèves',
      'Prépare en amont les séquences pédagogiques et les inscrit dans une progression réfléchie',
      'Met en place les outils et supports d\'évaluation en ciblant les compétences à évaluer',
      'Prend en charge le suivi du travail personnel des élèves',
      'S\'appuie sur les évaluations pour réguler sa pratique et les apprentissages',
    ],
    hasComment: true,
  },
  {
    section: 'Compétences relatives à l\'usage et à la maîtrise des technologies de l\'information et de la communication',
    subtitle: 'CC9. Intégrer les éléments de la culture numérique nécessaires à l\'exercice de son métier',
    items: [
      'Utilise les outils numériques et les réseaux mis en place dans l\'établissement',
      'Distingue les usages personnels et professionnels dans sa pratique',
      'Est attentif à la manière dont les élèves mobilisent l\'outil numérique',
    ],
    hasComment: true,
  },
  {
    section: 'Compétences d\'analyse et d\'adaptation de sa pratique professionnelle en tenant compte des évolutions du métier et de son environnement de travail',
    subtitle: 'CC14. S\'engager dans une démarche individuelle et collective de développement professionnel',
    items: [
      'Prend en compte les conseils prodigués et s\'efforce d\'améliorer sa pratique',
      'Est capable de prendre du recul et de porter une analyse réflexive sur sa pratique',
    ],
    hasComment: true,
  },
];

// Mapping des IDs de compétences vers les items officiels
const competenceMapping: Record<string, number[]> = {
  'reglementaires': [0, 1, 2, 3, 4], // Section 0, items 0-4
  'relationnelles': [0, 1, 2, 3, 4], // Section 1, items 0-4
  'disciplinaires': [0, 1, 2], // Section 2, items 0-2
  'pedagogiques': [0, 1, 2, 3, 4, 5, 6, 7, 8], // Section 3, items 0-8
  'numeriques': [0, 1, 2], // Section 4, items 0-2
  'developpement_pro': [0, 1], // Section 5, items 0-1
};

const itemIdMapping: Record<string, Record<string, number>> = {
  'reglementaires': {
    'principes_egalite': 0,
    'ponctualite': 1,
    'positionnement_adulte': 2,
    'respect_eleves': 3,
    'reglement_interieur': 4,
  },
  'relationnelles': {
    'langage_clair': 0,
    'travail_equipe': 1,
    'ecoute_echanges': 2,
    'participation_instances': 3,
    'communication_familles': 4,
  },
  'disciplinaires': {
    'maitrise_contenus': 0,
    'transpositions_didactiques': 1,
    'identification_savoirs': 2,
  },
  'pedagogiques': {
    'encadrement_groupe': 0,
    'climat_serein': 1,
    'encourage_valorise': 2,
    'objectifs_sens': 3,
    'diversite_eleves': 4,
    'preparation_sequences': 5,
    'outils_evaluation': 6,
    'suivi_travail': 7,
    'regulation_pratique': 8,
  },
  'numeriques': {
    'utilisation_outils': 0,
    'distinction_usages': 1,
    'attention_eleves': 2,
  },
  'developpement_pro': {
    'prise_compte_conseils': 0,
    'analyse_reflexive': 1,
  },
};

export function RapportPrintView({ rapport, onClose }: RapportPrintViewProps) {
  const handlePrint = () => {
    window.print();
  };

  // Fonction pour obtenir la valeur d'une compétence (consensus des deux tuteurs)
  const getCompetenceValue = (categoryId: string, itemId: string): string | null => {
    const categoryData = rapport.competences?.[categoryId];
    if (!categoryData) return null;

    const itemData = categoryData[itemId];
    if (!itemData) return null;

    // Nouveau format dual-tuteur
    if (typeof itemData === 'object' && itemData.tuteur1 && itemData.tuteur2) {
      // Si consensus, retourner la valeur
      if (itemData.tuteur1 === itemData.tuteur2) {
        return itemData.tuteur1;
      }
      // Si pas de consensus, indiquer les deux avis
      return `${itemData.tuteur1}/${itemData.tuteur2}`;
    }

    // Ancien format
    if (typeof itemData === 'string') {
      return itemData;
    }

    return null;
  };

  // Convertir la valeur en X dans la bonne colonne
  const renderCompetenceRow = (sectionIndex: number, itemIndex: number, itemText: string) => {
    const sectionKeys = ['reglementaires', 'relationnelles', 'disciplinaires', 'pedagogiques', 'numeriques', 'developpement_pro'];
    const categoryId = sectionKeys[sectionIndex];
    const itemIds = Object.keys(itemIdMapping[categoryId] || {});
    const itemId = itemIds.find(id => itemIdMapping[categoryId][id] === itemIndex);

    const value = itemId ? getCompetenceValue(categoryId, itemId) : null;

    const isEntretenir = value === 'entretenir' || value === 'suffisant';
    const isTravailler = value === 'travailler' || value?.includes('travailler');
    const isInvestir = value === 'investir' || value === 'insuffisant' || value === 'non_observe';

    return (
      <tr key={`${sectionIndex}-${itemIndex}`}>
        <td className="border border-black p-1 text-xs">{itemText}</td>
        <td className="border border-black p-1 text-center text-xs w-20">{isEntretenir ? '✓' : ''}</td>
        <td className="border border-black p-1 text-center text-xs w-20">{isTravailler ? '✓' : ''}</td>
        <td className="border border-black p-1 text-center text-xs w-20">{isInvestir ? '✓' : ''}</td>
      </tr>
    );
  };

  return (
    <div className="print-container">
      {/* Boutons (masqués à l'impression) */}
      <div className="print:hidden fixed top-4 right-4 flex gap-2 z-50">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Imprimer / PDF
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Fermer
        </button>
      </div>

      {/* Contenu du rapport */}
      <div className="max-w-[210mm] mx-auto bg-white p-8 print:p-4 print:max-w-none">
        {/* En-tête */}
        <div className="text-center mb-6">
          <h1 className="text-lg font-bold uppercase">
            Rapport intermédiaire {rapport.annee_scolaire || '2025-2026'}
          </h1>
          <h2 className="text-base font-bold uppercase">
            DU TUTEUR ÉTABLISSEMENT D'UN PROFESSEUR STAGIAIRE
          </h2>
          <p className="text-xs mt-2 italic">
            À transmettre par voie électronique à l'inspection pédagogique de la discipline avant le 17 janvier 2026
            avec copie au chef d'établissement du professeur stagiaire.
          </p>
        </div>

        {/* Tableaux Stagiaire + Tuteurs */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Stagiaire */}
          <table className="border-collapse border border-black text-xs w-full">
            <tbody>
              <tr><td className="border border-black p-1 font-bold bg-gray-100">STAGIAIRE :</td></tr>
              <tr><td className="border border-black p-1">Nom : {rapport.stagiaire_nom}</td></tr>
              <tr><td className="border border-black p-1">Prénom : {rapport.stagiaire_prenom}</td></tr>
              <tr><td className="border border-black p-1">Corps : {rapport.stagiaire_corps}</td></tr>
              <tr><td className="border border-black p-1">Établissement : {rapport.stagiaire_etablissement}</td></tr>
              <tr><td className="border border-black p-1">Discipline : {rapport.stagiaire_discipline}</td></tr>
            </tbody>
          </table>

          {/* Tuteur 1 */}
          <table className="border-collapse border border-black text-xs w-full">
            <tbody>
              <tr><td className="border border-black p-1 font-bold bg-gray-100">TUTEUR/TUTRICE 1 :</td></tr>
              <tr><td className="border border-black p-1">Nom : {rapport.tuteur1_nom}</td></tr>
              <tr><td className="border border-black p-1">Prénom : {rapport.tuteur1_prenom}</td></tr>
              <tr><td className="border border-black p-1">Établissement : {rapport.tuteur1_etablissement}</td></tr>
              <tr><td className="border border-black p-1">Discipline : {rapport.tuteur1_discipline}</td></tr>
            </tbody>
          </table>

          {/* Tuteur 2 */}
          <table className="border-collapse border border-black text-xs w-full">
            <tbody>
              <tr><td className="border border-black p-1 font-bold bg-gray-100">TUTEUR/TUTRICE 2 :</td></tr>
              <tr><td className="border border-black p-1">Nom : {rapport.tuteur2_nom}</td></tr>
              <tr><td className="border border-black p-1">Prénom : {rapport.tuteur2_prenom}</td></tr>
              <tr><td className="border border-black p-1">Établissement : {rapport.tuteur2_etablissement}</td></tr>
              <tr><td className="border border-black p-1">Discipline : {rapport.tuteur2_discipline}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Modalités d'accompagnement */}
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-2">Modalités d'accompagnement</h3>
          <table className="border-collapse border border-black text-xs w-full">
            <tbody>
              <tr>
                <td className="border border-black p-1 w-1/2">Nombre de visites effectuées par la tutrice ou le tuteur</td>
                <td className="border border-black p-1">{rapport.modalites?.visites_tuteur}</td>
              </tr>
              <tr>
                <td className="border border-black p-1">Nombre de visites effectuées par la stagiaire ou le stagiaire</td>
                <td className="border border-black p-1">{rapport.modalites?.visites_stagiaire}</td>
              </tr>
              <tr>
                <td className="border border-black p-1">Classes observées par la tutrice ou le tuteur</td>
                <td className="border border-black p-1">{rapport.modalites?.classes_observees_tuteur}</td>
              </tr>
              <tr>
                <td className="border border-black p-1">Classes observées par la stagiaire ou le stagiaire</td>
                <td className="border border-black p-1">{rapport.modalites?.classes_observees_stagiaire}</td>
              </tr>
              <tr>
                <td className="border border-black p-1">Organisation des plages de concertation</td>
                <td className="border border-black p-1">{rapport.modalites?.concertations}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Axes thématiques */}
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-1">Axes thématiques de formation du premier semestre</h3>
          <p className="text-xs italic mb-2">
            Identifier et expliciter trois axes thématiques de formation qui ont été prioritairement travaillés
            avec la stagiaire ou le stagiaire sur cette première période.
          </p>

          {[0, 1, 2].map((index) => {
            const axe = rapport.axes?.[index] || {};
            return (
              <table key={index} className="border-collapse border border-black text-xs w-full mb-4">
                <tbody>
                  <tr>
                    <td className="border border-black p-1 font-bold bg-gray-100">
                      Axe de formation travaillé avec la stagiaire ou le stagiaire
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 min-h-[30px]">{axe.titre}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 font-bold bg-gray-100">Constat de départ</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 min-h-[40px] whitespace-pre-wrap">{axe.constat_depart}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 font-bold bg-gray-100">Évolution constatée</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 min-h-[40px] whitespace-pre-wrap">{axe.evolution}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 font-bold bg-gray-100">État des lieux à ce jour</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 min-h-[40px] whitespace-pre-wrap">{axe.etat_actuel}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 font-bold bg-gray-100">
                      Compétences professionnelles du référentiel associées
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2">{axe.competences}</td>
                  </tr>
                </tbody>
              </table>
            );
          })}
        </div>

        {/* Saut de page avant les compétences */}
        <div className="print:break-before-page"></div>

        {/* Synthèse - Compétences */}
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-1">Synthèse pour la professeure ou le professeur stagiaire</h3>
          <p className="text-xs mb-2">
            <strong>à entretenir</strong> : compétence maîtrisée |
            <strong> à travailler encore</strong> : compétence travaillée mais pas suffisamment construite |
            <strong> à investir</strong> : compétence qui n'a pas encore fait l'objet d'un travail spécifique
          </p>

          <table className="border-collapse border border-black text-xs w-full">
            <thead>
              <tr>
                <th className="border border-black p-1 text-left">CC : compétences communes</th>
                <th className="border border-black p-1 w-20 text-center">à entretenir</th>
                <th className="border border-black p-1 w-20 text-center">à travailler encore</th>
                <th className="border border-black p-1 w-20 text-center">à investir</th>
              </tr>
            </thead>
            <tbody>
              {competencesOfficiel.map((section, sectionIndex) => (
                <React.Fragment key={sectionIndex}>
                  {/* Section header */}
                  <tr>
                    <td colSpan={4} className="border border-black p-1 bg-gray-200 font-bold text-xs">
                      {section.section}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="border border-black p-1 bg-gray-100 text-xs italic whitespace-pre-wrap">
                      {section.subtitle}
                    </td>
                  </tr>
                  {/* Items */}
                  {section.items.map((item, itemIndex) => renderCompetenceRow(sectionIndex, itemIndex, item))}
                  {/* Commentaires */}
                  {section.hasComment && (
                    <tr>
                      <td colSpan={4} className="border border-black p-1 bg-gray-50">
                        <span className="font-bold">Commentaires :</span>
                        <div className="min-h-[20px]"></div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <p className="text-xs mt-2 italic">
            Se rapporter au référentiel de compétences dans lequel chaque compétence est accompagnée d'items
            qui en détaillent les composantes et en précisent le champ. BO n°30 du 25 juillet 2013
          </p>
        </div>

        {/* Axes de travail pour la fin de l'année */}
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-2">Axes de travail pour la fin de l'année</h3>
          <table className="border-collapse border border-black text-xs w-full">
            <tbody>
              <tr>
                <td className="border border-black p-1 font-bold bg-gray-100">
                  Compétences qu'il est nécessaire de conforter
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 min-h-[60px] whitespace-pre-wrap">
                  {rapport.axes_fin_annee?.a_conforter}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 font-bold bg-gray-100">
                  Nouvelles compétences à travailler
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 min-h-[60px] whitespace-pre-wrap">
                  {rapport.axes_fin_annee?.a_travailler}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="mt-8">
          <table className="border-collapse border border-black text-xs w-full">
            <tbody>
              <tr>
                <td className="border border-black p-2 w-1/2">
                  <div>Date : {rapport.signature_tuteur1_date ? new Date(rapport.signature_tuteur1_date).toLocaleDateString('fr-FR') : ''}</div>
                  <div className="mt-4">Signature du ou des tuteurs :</div>
                  <div className="min-h-[40px]"></div>
                </td>
                <td className="border border-black p-2">
                  <div>Date : {rapport.signature_stagiaire_date ? new Date(rapport.signature_stagiaire_date).toLocaleDateString('fr-FR') : ''}</div>
                  <div className="mt-4">Signature de la stagiaire ou du stagiaire :</div>
                  <div className="min-h-[40px]"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Styles d'impression */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-container {
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:break-before-page {
            break-before: page;
          }
        }
      `}</style>
    </div>
  );
}

export default RapportPrintView;
