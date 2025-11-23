# Issue: Documents non visibles entre tuteurs

## Date: 2025-11-19

## Problème signalé
Les documents déposés par une collègue (tuteur) ne sont pas visibles par les autres tuteurs.

## Analyse effectuée

### Cause identifiée : Politique RLS (Row Level Security)

La politique de visibilité dans Supabase bloque les documents :

**Fichier migration :** `supabase/migrations/20250819074033_6730706e-6eec-46d1-88c6-5c417ffcb813.sql`

```sql
CREATE POLICY "Visibility based on user role and sharing preferences"
ON public.documents
FOR SELECT
USING (
  -- Stagiaires peuvent voir tous les documents
  (public.get_current_user_role() = 'stagiaire') OR
  -- Tuteurs voient leurs propres docs OU les docs partagés
  (public.get_current_user_role() = 'tuteur' AND
   (auth.uid() = tuteur_id OR shared_with_peers = true))
);
```

### Conséquence
- **Stagiaires** : voient TOUS les documents
- **Tuteurs** : voient UNIQUEMENT :
  1. Leurs propres documents
  2. Documents où `shared_with_peers = true`

Si un tuteur dépose un document avec `shared_with_peers = false`, les autres tuteurs ne le voient pas.

## Fichiers concernés

- **Composant principal :** `src/components/Documents.tsx`
  - Ligne 53 : `sharedWithPeers: true` (défaut)
  - Lignes 403-410 : Toggle pour partager avec les pairs

- **Contexte de données :** `src/context/DataContext.tsx`
  - Lignes 206-217 : Insert document avec `shared_with_peers`
  - Lignes 462-480 : Reload documents

- **Hook :** `src/hooks/useDocuments.ts`

- **Types :** `src/types/index.ts`
  - Interface Document avec `sharedWithPeers?: boolean`

## Vérification à faire

### 1. Vérifier les données dans Supabase

```sql
-- Voir tous les documents et leur état de partage
SELECT id, titre, shared_with_peers, tuteur_id, created_at
FROM documents
ORDER BY created_at DESC;
```

### 2. Vérifier les rôles des utilisateurs

```sql
SELECT user_id, display_name, role FROM profiles;
```

## Solutions proposées

### Option 1 : Corriger les documents existants (Quick fix)

Dans la console Supabase :
```sql
UPDATE documents SET shared_with_peers = true WHERE shared_with_peers = false;
```

### Option 2 : Forcer le partage systématiquement

Modifier `src/context/DataContext.tsx` ligne 214 :
```typescript
// Avant
shared_with_peers: documentData.sharedWithPeers ?? true

// Après - forcer toujours à true
shared_with_peers: true
```

Et retirer le toggle du formulaire dans `src/components/Documents.tsx` (lignes 403-410).

### Option 3 : Modifier la politique RLS

Dans Supabase, créer une nouvelle migration :
```sql
-- Permettre aux tuteurs de voir tous les documents d'autres tuteurs
DROP POLICY IF EXISTS "Visibility based on user role and sharing preferences" ON public.documents;

CREATE POLICY "All tuteurs can see all documents"
ON public.documents
FOR SELECT
USING (
  public.get_current_user_role() IN ('stagiaire', 'tuteur', 'admin')
);
```

### Option 4 : Ajouter le rôle admin à la politique

```sql
DROP POLICY IF EXISTS "Visibility based on user role and sharing preferences" ON public.documents;

CREATE POLICY "Visibility based on user role and sharing preferences"
ON public.documents
FOR SELECT
USING (
  (public.get_current_user_role() = 'stagiaire') OR
  (public.get_current_user_role() = 'admin') OR
  (public.get_current_user_role() = 'tuteur' AND
   (auth.uid() = tuteur_id OR shared_with_peers = true))
);
```

## Recommandation

**Option 3** est la plus simple si tous les tuteurs doivent voir tous les documents.

Si le partage sélectif est important, appliquer **Option 1** pour corriger les données existantes et s'assurer que le toggle est visible et compris par les utilisateurs.

## Pour reprendre le travail

1. Ouvrir la console Supabase du projet
2. Exécuter la requête de vérification pour voir l'état des documents
3. Appliquer la solution choisie
4. Tester avec deux comptes tuteurs différents
5. Déployer si nécessaire

## Contact

Ce document a été créé suite à l'analyse du 19/11/2025.
