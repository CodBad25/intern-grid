# Configuration Supabase - SUIVI STAG

## ✅ Configuration actuelle (CORRECTE)

**Compte Supabase :** Lovable Projects (lié au GitHub: badribelhaj@chaissacschool.om)

**Projet :**
- **ID :** crubptrkqcvedvpxmplx
- **URL :** https://crubptrkqcvedvpxmplx.supabase.co
- **Dashboard :** https://supabase.com/dashboard/project/crubptrkqcvedvpxmplx

**Fichier `.env` :**
```env
VITE_SUPABASE_PROJECT_ID="crubptrkqcvedvpxmplx"
VITE_SUPABASE_URL="https://crubptrkqcvedvpxmplx.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGc..." (JWT valide)
```

## 🔐 Accès au compte Supabase

**IMPORTANT :** Pour accéder au dashboard Supabase :

1. Aller sur https://supabase.com/dashboard
2. Cliquer sur **"Continue with GitHub"**
3. Se connecter avec : **badribelhaj@chaissacschool.om**
4. Sélectionner l'organisation : **Lovable Projects**

## 📊 Structure de la base de données

Le projet contient les tables suivantes :
- `profiles` : Profils utilisateurs
- `seances` : Séances de suivi
- `documents` : Documents partagés
- `commentaires` : Commentaires sur les séances
- `notifications` : Notifications système
- `evenements` : Événements calendrier
- `reactions` : Réactions aux séances
- `reponses` : Réponses aux séances

## ⚠️ Comptes Supabase disponibles (NE PAS CONFONDRE)

Vous avez 3 organisations Supabase :

### 1. Lovable Projects ← ✅ **LE BON COMPTE**
- **Accès :** Via GitHub (badribelhaj@chaissacschool.om)
- **Projet :** crubptrkqcvedvpxmplx
- **Usage :** PRODUCTION + DÉVELOPPEMENT
- **Statut :** Contient toutes les données

### 2. CodBad25's Org ← ❌ NE PAS UTILISER
- **Projet :** anxxfovjgabhmcfxkqtc
- **Usage :** Test/Vide
- **Statut :** 0 utilisateurs, aucune donnée

### 3. Mohamed Belhaj's projects ← ❌ NE PAS UTILISER
- **Projet :** anjwzfaftvzyguhcoxhb
- **Usage :** Autre projet (gestion-projets)
- **Statut :** Pausé

## 📝 Notes importantes

- ⚠️ **Ne JAMAIS hardcoder** les credentials dans `client.ts`
- ⚠️ **Toujours utiliser** `import.meta.env.VITE_SUPABASE_*`
- ⚠️ **Vérifier le contenu du projet** avant de changer les credentials
- ⚠️ **Se connecter avec le compte GitHub** badribelhaj@chaissacschool.om

## 🔗 Liens utiles

- **Dashboard Supabase :** https://supabase.com/dashboard/project/crubptrkqcvedvpxmplx
- **Documentation complète :** Voir `PROBLEME_SUPABASE_RESOLU.md`
- **Prévention pause automatique :** Voir section "Prévention" dans `PROBLEME_SUPABASE_RESOLU.md`
