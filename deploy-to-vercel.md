# 🚀 Déploiement sur Vercel

## Méthode 1 : Via le site Vercel (Recommandée)

1. **Va sur** : https://vercel.com/
2. **Connecte-toi** avec ton compte GitHub/GitLab
3. **Clique "New Project"**
4. **Upload le dossier** `D:\DEV\SUIVI STAG-V2\intern-grid-main`
5. **Configure les variables d'environnement** :
   - `VITE_SUPABASE_URL` = `https://crubptrkqcvedvpxmplx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Méthode 2 : Via CLI Vercel

```bash
npm install -g vercel
cd "D:\DEV\SUIVI STAG-V2\intern-grid-main"
vercel --prod
```

## Variables d'environnement nécessaires

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Build Command
- `npm run build`

## Output Directory  
- `dist`
