# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/77fa55fc-b2a3-4525-a6cc-5df0c495c454

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/77fa55fc-b2a3-4525-a6cc-5df0c495c454) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Fonctionnalités de l'Application

### Version Actuelle (v3.0) - Décembre 2025

#### 📋 Rapports d'Évaluation (Nouveau)
- **Rapport Intermédiaire** : Échéance 17 janvier 2026
- **Rapport Final** : Échéance juin 2026
- **Système dual-tuteur** : Chaque tuteur évalue indépendamment les compétences
- **Consensus automatique** : Détection des accords/désaccords entre tuteurs
- **Impression PDF** : Format officiel académique conforme au modèle de l'Éducation Nationale
- **27 compétences** réparties en 6 sections officielles
- **Axes thématiques** de travail avec suivi d'évolution
- **Visibilité partagée** entre les deux tuteurs

#### 📁 Documents & Ressources (Amélioré)
- **6 catégories** : Pédagogie, Administratif, Outils, Ressources, Formation, Autre
- **Filtres par chips** cliquables avec compteurs
- **Vue Grille / Liste** au choix
- **Design épuré** : cartes avec favicon et bordure colorée par catégorie
- **Barre de recherche** toujours visible
- Upload direct depuis le PC (PDF, Word, images)
- Stockage sécurisé en Europe (Supabase)

#### 🧭 Navigation Simplifiée
- Tous les boutons de navigation visibles (pas de dropdowns)
- Mobile : onglets Objectifs et Rapports ajoutés
- Logo ST supprimé pour plus d'espace

#### 🔔 Système de Notifications Avancé
- **Mises à jour en temps réel** via WebSockets (Supabase Realtime)
- **Filtrage avancé** : Par type, statut (lu/non lu), et période
- **Gestion intelligente** : Notifications automatiques entre utilisateurs
- **Interface intuitive** : Dropdown avec compteur de notifications non lues

#### 📚 Gestion Complète des Stagiaires
- **Séances** : Planification avec types (visite, formation, évaluation) et modes horaires (M1-M4, S1-S4)
- **Documents** : Upload de fichiers et partage de liens avec catégories
- **Remarques & Questions** : Système de commentaires interactif avec réactions émojis
- **Planning** : Vue calendaire avec créneaux et couleurs par tuteur
- **Objectifs & Tâches** : Suivi avec statuts et liaisons aux visites
- **Dashboard** : Statistiques en temps réel et vue d'ensemble

#### 👥 Présence & Profils
- Indicateur d'utilisateurs en ligne en temps réel
- Avatars personnalisés avec upload
- Couleurs personnalisées pour chaque tuteur
- Statuts personnalisables (Disponible, En réunion, etc.)

#### 🔐 Sécurité & Backend
- Authentification Supabase complète
- Stockage sécurisé en Europe (RGPD)
- Rôles : Tuteur, Admin, Stagiaire
- Sessions persistantes et permissions RLS

### Prochaines Versions

#### v3.1 (Planifié)
- 📋 Notifications push natives
- 📋 API REST complète
- 📋 Mode hors ligne avec synchronisation
- 📋 Chat en temps réel

Pour plus de détails, consultez l'onglet **Fonctionnalités** dans l'application.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/77fa55fc-b2a3-4525-a6cc-5df0c495c454) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
