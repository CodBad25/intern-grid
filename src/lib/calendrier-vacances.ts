// Format YYYY-MM-DD basé sur l'heure locale (évite les décalages timezone
// qu'on aurait avec `Date.toISOString()` qui convertit en UTC).
const toLocalISODate = (d: Date): string => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Vacances scolaires Zone B (Nantes) 2025-2026 — bornes INCLUSIVES au format YYYY-MM-DD.
// La date de fin est le DERNIER JOUR de vacances (la rentrée a lieu le lendemain).
export const VACANCES_ZONE_B = [
  // Été 2025 (rentrée scolaire le lundi 1er septembre 2025)
  { debut: '2025-07-05', fin: '2025-08-31' },
  // Toussaint 2025 (rentrée lundi 3 novembre 2025)
  { debut: '2025-10-18', fin: '2025-11-02' },
  // Noël 2025-2026 (rentrée lundi 5 janvier 2026)
  { debut: '2025-12-20', fin: '2026-01-04' },
  // Hiver 2026 (rentrée lundi 2 mars 2026)
  { debut: '2026-02-14', fin: '2026-03-01' },
  // Printemps 2026 (rentrée lundi 27 avril 2026)
  { debut: '2026-04-11', fin: '2026-04-26' },
  // Été 2026 (à partir du samedi 4 juillet 2026)
  { debut: '2026-07-04', fin: '2026-08-31' },
];

export const JOURS_FERIES = [
  '2025-11-01', // Toussaint
  '2025-11-11', // Armistice 1918
  '2025-12-25', // Noël
  '2026-01-01', // Jour de l'an
  '2026-04-06', // Lundi de Pâques
  '2026-05-01', // Fête du travail
  '2026-05-08', // Victoire 1945
  '2026-05-14', // Ascension
  '2026-05-25', // Lundi de Pentecôte
  '2026-07-14', // Fête nationale
];

export const isVacances = (date: Date): boolean => {
  const iso = toLocalISODate(date);
  return VACANCES_ZONE_B.some(periode => iso >= periode.debut && iso <= periode.fin);
};

export const isJourFerie = (date: Date): boolean => {
  const iso = toLocalISODate(date);
  return JOURS_FERIES.includes(iso);
};

/**
 * Renvoie un libellé "vacances" / "jour férié" si la date tombe sur l'un d'eux,
 * sinon null. Utile pour les messages d'erreur.
 */
export const labelHorsClasse = (date: Date): string | null => {
  if (isJourFerie(date)) return 'jour férié';
  if (isVacances(date)) return 'vacances scolaires';
  return null;
};
