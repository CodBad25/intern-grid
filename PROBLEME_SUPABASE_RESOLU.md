# 🔧 Problème Supabase - Résolu le 24 décembre 2025

## 📋 Résumé

**Problème :** Erreur "Failed to fetch" / "NetworkError when attempting to fetch resource" au démarrage de l'application en local

**Cause :** Le projet Supabase était **pausé automatiquement** après 7 jours d'inactivité (limitation du plan gratuit)

**Solution :** Réactivation du projet Supabase sur le bon compte (compte GitHub Lovable)

---

## 🔍 Diagnostic initial

### Erreurs observées
```
Erreur de connexion: Failed to fetch
Erreur de connexion: NetworkError when attempting to fetch resource
Email ou mot de passe incorrect (après avoir changé les credentials)
```

### Première investigation (ERREUR)

**Ce qui a été fait (à NE PAS refaire) :**
1. ❌ Vérification du fichier `client.ts` - clé invalide détectée : `sb_publishable_6znrKNhdJfoJvYLuHFeciQ__AKMFhbr`
2. ❌ Test de connectivité : `curl https://crubptrkqcvedvpxmplx.supabase.co` → DNS ne résout pas
3. ❌ Recherche dans le compte **CodBad25's Org** → Projet `anxxfovjgabhmcfxkqtc` trouvé
4. ❌ Changement des credentials vers le projet `anxxfovjgabhmcfxkqtc`
5. ❌ **ERREUR** : Ce projet était vide (0 utilisateurs, 0 données)

### Confusion avec les comptes Supabase

Le développeur possède **3 organisations Supabase** :

1. **CodBad25's Org** (compte principal)
   - Projet : `anxxfovjgabhmcfxkqtc` (SUIVI STAG)
   - Statut : **VIDE** - Aucune donnée
   - ❌ **NE PAS UTILISER**

2. **Mohamed Belhaj's projects** (Vercel integration)
   - Projet : `anjwzfaftvzyguhcoxhb` (gestion-projets)
   - Statut : Pausé
   - ❌ **NE PAS UTILISER** (autre projet)

3. **Lovable Projects** ← **✅ LE BON COMPTE**
   - Compte lié à GitHub : **badribelhaj@chaissacschool.om**
   - Projet : `crubptrkqcvedvpxmplx` (SUIVI STAG - PROD)
   - Statut : Contient toutes les données
   - ✅ **UTILISER CELUI-CI**

---

## ✅ Solution finale

### Étape 1 : Connexion au bon compte Supabase

**IMPORTANT :** Se connecter à Supabase avec le compte **GitHub** : `badribelhaj@chaissacschool.om`

1. Aller sur https://supabase.com/dashboard
2. Se connecter avec **"Continue with GitHub"**
3. Utiliser le compte : **badribelhaj@chaissacschool.om**
4. Accéder au projet : https://supabase.com/dashboard/project/crubptrkqcvedvpxmplx

### Étape 2 : Réactivation du projet

Le projet était **pausé** (inactivité > 7 jours). Actions effectuées :

1. Dashboard Supabase → Projet `crubptrkqcvedvpxmplx`
2. Bouton "Resume project" / "Unpause project"
3. Attendre 2-3 minutes le redémarrage
4. Vérifier que le statut passe à "Active"

### Étape 3 : Vérification des credentials

Les credentials **CORRECTES** (déjà dans `.env`) :

```env
VITE_SUPABASE_PROJECT_ID="crubptrkqcvedvpxmplx"
VITE_SUPABASE_URL="https://crubptrkqcvedvpxmplx.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNydWJwdHJrcWN2ZWR2cHhtcGx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTM2MTMsImV4cCI6MjA3MTA4OTYxM30.Hm5E_OlLuvwmNiD79jCrdvUuEFUawnsy-_O-TeSnaBY"
```

### Étape 4 : Redémarrage du serveur

```bash
# Vider le cache Vite
rm -rf node_modules/.vite

# Redémarrer le serveur
npm run dev
```

### Étape 5 : Test de connexion

✅ Connexion réussie avec les identifiants utilisateur
✅ Données visibles (séances, documents, profils, etc.)
✅ Site fonctionnel en local ET en production

---

## 🔒 Protections mises en place

### 1. Validation dans `client.ts`

Le fichier `src/integrations/supabase/client.ts` contient maintenant des validations :

```typescript
// Validation: ensure environment variables are loaded
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('❌ Supabase configuration error: Missing environment variables');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Validation: ensure we're using real Supabase keys (JWT format), not Lovable proxy keys
if (SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_')) {
  console.error('❌ Invalid Supabase key detected: Using Lovable proxy key instead of real JWT');
  throw new Error('Invalid Supabase configuration: Proxy key detected. Use real JWT key from .env');
}

// Validation: ensure key is in JWT format
if (!SUPABASE_PUBLISHABLE_KEY.startsWith('eyJ')) {
  console.error('❌ Invalid Supabase key format: Expected JWT starting with "eyJ"');
  throw new Error('Invalid Supabase key format. Please verify your .env file.');
}

console.log('✅ Supabase client initialized successfully');
console.log('📍 URL:', SUPABASE_URL);
```

Ces validations bloquent le démarrage si :
- Les variables d'environnement sont manquantes
- Une clé proxy Lovable invalide est utilisée
- La clé n'est pas au format JWT

### 2. Documentation créée

- `PROBLEME_SUPABASE_RESOLU.md` (ce fichier)
- `SUPABASE_CONFIG.md` (configuration et comptes)

---

## 🛡️ Prévention : Éviter la pause automatique

### Pourquoi le projet se met-il en pause ?

Supabase **Free Tier** met automatiquement en pause les projets après **7 jours d'inactivité**.

### Solutions recommandées

#### Option 1 : Uptime Robot (GRATUIT - Recommandé) 🌟

**Service :** https://uptimerobot.com

**Configuration :**
1. Créer un compte gratuit
2. Ajouter un "New Monitor"
   - Type : HTTP(s)
   - URL : `https://crubptrkqcvedvpxmplx.supabase.co`
   - Monitoring Interval : 5 minutes
3. Activer les alertes email

**Effet :** Le ping régulier empêche la pause automatique

#### Option 2 : GitHub Actions (GRATUIT)

Créer `.github/workflows/keep-supabase-alive.yml` :

```yaml
name: Keep Supabase Active
on:
  schedule:
    - cron: '0 2 * * *'  # Tous les jours à 2h du matin
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase
        run: |
          curl -X GET "https://crubptrkqcvedvpxmplx.supabase.co/rest/v1/" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}"
```

#### Option 3 : Rappel calendrier (MANUEL)

- Ajouter un rappel mensuel
- Se connecter au site en production pour générer de l'activité
- Moins fiable que les options automatiques

#### Option 4 : Supabase Pro (8$/mois)

**Avantages :**
- ✅ Pas de pause automatique
- ✅ Plus de ressources (CPU, RAM, Storage)
- ✅ Backups automatiques quotidiens
- ✅ Support prioritaire

---

## 📚 Informations importantes

### Compte Supabase à utiliser

**TOUJOURS se connecter avec :**
- **Email GitHub :** badribelhaj@chaissacschool.om
- **Méthode :** "Continue with GitHub" sur https://supabase.com/dashboard
- **Organisation :** Lovable Projects
- **Projet :** crubptrkqcvedvpxmplx

### Renommage du projet

Le projet a été **renommé** pour éviter la confusion avec les autres projets Supabase.

**Nouveau nom :** [À COMPLÉTER avec le nouveau nom du projet]

### Fichiers de configuration

- `.env` : Contient les credentials (ne JAMAIS committer)
- `src/integrations/supabase/client.ts` : Client Supabase avec validations
- `supabase/migrations/` : Migrations de la base de données (BACKUP)

### Environnements

**Local (développement) :**
- URL : http://localhost:5174/
- Utilise : `.env` local
- Base de données : `crubptrkqcvedvpxmplx`

**Production (Vercel) :**
- URL : [URL de production Vercel]
- Utilise : Variables d'environnement Vercel
- Base de données : `crubptrkqcvedvpxmplx` (même que local)

---

## ⚠️ Checklist de vérification

Avant de modifier les credentials, **TOUJOURS vérifier** :

- [ ] Vous êtes connecté au bon compte Supabase (GitHub: badribelhaj@chaissacschool.om)
- [ ] Le projet contient des données (vérifier table `profiles` ou `seances`)
- [ ] L'URL est accessible : `https://crubptrkqcvedvpxmplx.supabase.co`
- [ ] La clé est au format JWT (commence par `eyJ`)
- [ ] Le projet n'est pas pausé
- [ ] Vous avez testé la connexion AVANT de committer

---

## 🚨 En cas de problème futur

### Symptôme : "Failed to fetch" / "NetworkError"

**1. Vérifier l'état du projet**
```bash
curl -I https://crubptrkqcvedvpxmplx.supabase.co
```

Si **404** → Projet pausé ou supprimé

**2. Se connecter au dashboard Supabase**
- https://supabase.com/dashboard (avec GitHub: badribelhaj@chaissacschool.om)
- Vérifier l'état du projet `crubptrkqcvedvpxmplx`
- Si pausé : "Resume project"

**3. Vérifier les credentials**
```bash
cat .env
# Doit contenir crubptrkqcvedvpxmplx, PAS anxxfovjgabhmcfxkqtc
```

**4. Redémarrer proprement**
```bash
rm -rf node_modules/.vite
npm run dev
```

**5. Vérifier la console du navigateur**
- Devrait afficher : "✅ Supabase client initialized successfully"
- Et : "📍 URL: https://crubptrkqcvedvpxmplx.supabase.co"

### Symptôme : "Email ou mot de passe incorrect"

➡️ **Mauvais projet Supabase !**

Vous êtes probablement connecté à un projet vide (anxxfovjgabhmcfxkqtc).

**Solution :**
1. Vérifier `.env` → doit contenir `crubptrkqcvedvpxmplx`
2. Vider le cache : `rm -rf node_modules/.vite`
3. Redémarrer : `npm run dev`

---

## 📞 Support

**Documentation Supabase :**
- https://supabase.com/docs
- https://supabase.com/dashboard/support

**Restauration depuis migrations :**
Si toutes les données sont perdues, elles peuvent être restaurées depuis :
- `/supabase/migrations/` (structure de la base)
- Backup manuel si effectué

**Contact développeur Claude Code :**
Session du 24 décembre 2025

---

## ✅ Résolution finale

**Date :** 24 décembre 2025
**Statut :** ✅ **RÉSOLU**
**Durée du problème :** ~2 heures
**Cause :** Pause automatique Supabase Free Tier
**Solution :** Réactivation du projet sur le bon compte

**Site fonctionnel :**
- ✅ Local : http://localhost:5174/
- ✅ Production : [URL Vercel]

---

**Note :** Ce document doit être conservé et consulté en cas de problème similaire à l'avenir.
