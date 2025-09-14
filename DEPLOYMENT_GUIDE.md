# 🚀 Guide de Déploiement - Éviter les Galères

## ✅ **Workflow de Déploiement Simplifié**

### **1. Toujours utiliser la branche `main`**
```bash
# Configurer la branche par défaut
git branch -m master main
git push --set-upstream origin main
```

### **2. Workflow de déploiement standard**
```bash
# 1. Faire les modifications
# 2. Tester en local
npm run dev

# 3. Ajouter et committer
git add .
git commit -m "Description claire des changements"

# 4. Pousser vers GitHub
git push origin main
```

### **3. Vérification Vercel**
- ✅ Vercel doit être configuré sur la branche `main`
- ✅ Le déploiement se déclenche automatiquement
- ✅ Attendre 2-3 minutes pour la propagation

## 🛠️ **Configuration Vercel Recommandée**

### **vercel.json (obligatoire pour React Router)**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🚨 **Problèmes Courants et Solutions**

### **1. Erreur 404 sur les routes**
- ❌ **Problème** : `vercel.json` manquant ou incorrect
- ✅ **Solution** : Ajouter les rewrites ci-dessus

### **2. Données qui n'apparaissent qu'après refresh**
- ❌ **Problème** : État de chargement manquant
- ✅ **Solution** : Utiliser `isLoading` dans les contextes

### **3. Vercel ne déploie pas**
- ❌ **Problème** : Mauvaise branche configurée
- ✅ **Solution** : Vérifier que Vercel surveille `main`

### **4. Conflit de branches master/main**
- ❌ **Problème** : Branches désynchronisées
- ✅ **Solution** : 
```bash
git push origin master:main --force
```

## 📝 **Checklist Avant Déploiement**

- [ ] Tests en local fonctionnels (`npm run dev`)
- [ ] Pas d'erreurs de linting
- [ ] `vercel.json` présent et correct
- [ ] Commit avec message descriptif
- [ ] Push vers la branche `main`
- [ ] Vérification Vercel après 3 minutes

## 🎯 **Workflow Professionnel**

1. **Développement local** → Tester toutes les fonctionnalités
2. **Commit atomiques** → Un commit = une fonctionnalité
3. **Messages clairs** → "Fix routing issues" plutôt que "update"
4. **Push réguliers** → Ne pas attendre des jours
5. **Vérification déploiement** → Toujours tester la version en ligne

---

💡 **Conseil** : Gardez ce guide à portée de main pour éviter les frustrations futures !
