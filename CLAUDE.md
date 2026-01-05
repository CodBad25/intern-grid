# CLAUDE.md - Projet Suivi Stagiaire

## Stack technique
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (backend)
- @react-pdf/renderer (génération PDF)

## Génération PDF des rapports

### Librairie utilisée
`@react-pdf/renderer` - Permet un contrôle précis de la mise en page PDF.

### Fichiers clés
- `src/components/rapports/RapportPDF.tsx` - Composant de génération PDF
- `src/components/rapports/RapportPrintView.tsx` - Vue d'impression avec bouton téléchargement

### Configuration des axes 2, 3, 4 sur une seule page

Les axes 2, 3 et 4 tiennent sur une seule page grâce à ces paramètres :

```javascript
// Page avec marges réduites
pageAxes: {
  padding: 15,
  fontSize: 9,
  fontFamily: 'Helvetica',
},

// Tableaux compacts (10pt)
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
```

### Structure du PDF
- **Page 1** : En-tête + infos stagiaire/tuteurs + modalités + Axe 1
- **Page 2** : Axes 2, 3, 4 (police 10pt, marges réduites)
- **Page 3** : Compétences sections 1-3
- **Page 4** : Compétences sections 4-6
- **Page 5** : Axes fin d'année + signatures

### Test de mise en page
Un fichier de test HTML existe pour tester différentes tailles de police :
`public/test-axes.html`

## Formulaire de compétences

### Champs commentaires
Chaque catégorie de compétences a un champ commentaire qui utilise un composant **non-contrôlé** (useRef + defaultValue + onBlur) pour éviter les problèmes de scroll lors de la saisie.

### Fichier
`src/components/rapports/CompetenceGrid.tsx`

## Notes importantes

- Les caractères spéciaux (✓) ne fonctionnent pas avec la police Helvetica dans react-pdf → utiliser 'X' à la place
- react-pdf rend différemment du HTML/CSS standard, prévoir des marges plus serrées
