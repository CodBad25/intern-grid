# TODO - Système de catégories pour Documents & Liens

## Contexte

Date: 24 novembre 2025
Session de discussion avec Claude Code

L'utilisateur mentionne avoir développé un système de catégories et filtres pour l'onglet Documents & Liens, mais **aucune trace n'existe dans le code actuel**.

## État actuel du code

### Fichier: `src/components/Documents.tsx`

**Filtres existants (basiques):**
1. ✅ Recherche textuelle (titre, description, tuteur)
2. ✅ Filtre par type: `document` ou `lien`

**Ce qui manque:**
- ❌ Catégories thématiques
- ❌ Tags/labels
- ❌ Filtre par source (manuel vs auto-extrait)
- ❌ Filtre par date
- ❌ Filtre par auteur/tuteur

### Fichier: `src/types/index.ts` (lignes 30-40)

```typescript
export interface Document {
  id: string;
  titre: string;
  type: 'document' | 'lien';  // ← Seulement 2 types
  url?: string;
  description: string;
  tuteurId: string;
  tuteurName: string;
  sharedWithPeers?: boolean;
  createdAt: string;
  // ❌ Pas de champ "category", "tags", ou "labels"
}
```

## Problème identifié: Liens "en vrac"

Les liens extraits automatiquement des séances (table `liens`) sont mélangés avec les documents/liens ajoutés manuellement (table `documents`) sans distinction claire.

**Exemple:**
- Une séance contient `https://eduscol.fr` dans les notes
- Le lien est auto-extrait et sauvegardé dans la table `liens`
- Il apparaît dans l'onglet Documents & Liens
- ❌ Aucune indication de sa provenance (séance X du Y)
- ❌ Pas de lien vers la séance source
- ❌ Mélangé avec les liens ajoutés manuellement

## Proposition de solution

### 1. Ajouter des catégories

**Catégories suggérées:**
- 📚 Pédagogie / Ressources
- 📋 Administratif
- 📖 Référentiel / Programmes
- 🎓 Formation
- 🔗 Outils / Sites utiles
- 📄 Modèles / Templates
- ❓ Autre

**Modifications requises:**

#### A. Base de données (Migration SQL)
```sql
-- Ajouter colonne category à la table documents
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS category TEXT;

-- Ajouter colonne tags (array)
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
```

#### B. Types TypeScript (`src/types/index.ts`)
```typescript
export const DOCUMENT_CATEGORIES = [
  { value: 'pedagogie', label: '📚 Pédagogie', icon: BookOpen },
  { value: 'administratif', label: '📋 Administratif', icon: FileText },
  { value: 'referentiel', label: '📖 Référentiel', icon: Library },
  { value: 'formation', label: '🎓 Formation', icon: GraduationCap },
  { value: 'outils', label: '🔗 Outils', icon: Link },
  { value: 'modeles', label: '📄 Modèles', icon: FileTemplate },
  { value: 'autre', label: '❓ Autre', icon: MoreHorizontal },
] as const;

export interface Document {
  id: string;
  titre: string;
  type: 'document' | 'lien';
  category?: string; // ← NOUVEAU
  tags?: string[];   // ← NOUVEAU
  url?: string;
  description: string;
  tuteurId: string;
  tuteurName: string;
  sharedWithPeers?: boolean;
  sourceType?: 'manual' | 'auto-extracted'; // ← NOUVEAU pour distinguer
  sourceId?: string; // ← ID de la séance source si auto-extrait
  createdAt: string;
}
```

#### C. Interface Documents.tsx

**Ajouter un filtre par catégorie:**
```typescript
const [categoryFilter, setCategoryFilter] = useState<string>('all');

// Dans le formulaire d'ajout
<div>
  <Label>Catégorie</Label>
  <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
    {DOCUMENT_CATEGORIES.map(cat => (
      <SelectItem key={cat.value} value={cat.value}>
        {cat.label}
      </SelectItem>
    ))}
  </Select>
</div>

// Dans les filtres
<div>
  <Label htmlFor="categoryFilter">Catégorie</Label>
  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
    <SelectItem value="all">Toutes les catégories</SelectItem>
    {DOCUMENT_CATEGORIES.map(cat => (
      <SelectItem key={cat.value} value={cat.value}>
        {cat.label}
      </SelectItem>
    ))}
  </Select>
</div>
```

**Afficher la source des liens auto-extraits:**
```typescript
{document.sourceType === 'auto-extracted' && document.sourceId && (
  <Badge variant="outline" className="text-xs">
    <LinkIcon className="w-3 h-3 mr-1" />
    Extrait de la séance
    <Button
      variant="link"
      size="sm"
      onClick={() => navigateToSeance(document.sourceId)}
    >
      Voir la séance
    </Button>
  </Badge>
)}
```

### 2. Améliorer la logique de combinaison (lignes 98-130)

```typescript
const combinedDocuments = useMemo(() => {
  const docs = [...documents];

  const lienDocs: Document[] = liens.map((l) => {
    // ... code existant ...
    return {
      id: `lien:${l.id}`,
      titre: title || l.url,
      type: 'lien',
      url: l.url,
      description: l.description || '',
      tuteurId: l.user_id,
      tuteurName: '',
      createdAt: l.created_at,
      sourceType: 'auto-extracted', // ← NOUVEAU
      sourceId: l.source_id,         // ← NOUVEAU
      category: 'autre',              // ← Catégorie par défaut
    } as Document;
  });

  // ... reste du code
}, [documents, liens]);
```

### 3. Composant Tags (optionnel)

**Créer un composant pour ajouter/gérer les tags:**
```typescript
// src/components/TagInput.tsx
export function TagInput({
  value = [],
  onChange
}: {
  value: string[];
  onChange: (tags: string[]) => void
}) {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          placeholder="Ajouter un tag..."
        />
        <Button type="button" onClick={addTag}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {value.map(tag => (
          <Badge key={tag} variant="secondary">
            {tag}
            <button onClick={() => removeTag(tag)} className="ml-1">×</button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
```

## Tâches à faire

### Phase 1: Base de données
- [ ] Créer migration SQL pour ajouter `category` et `tags` à la table `documents`
- [ ] Créer migration SQL pour ajouter `source_type` et `source_id` à la table `liens`
- [ ] Appliquer les migrations avec `supabase db push`

### Phase 2: Types
- [ ] Modifier l'interface `Document` dans `src/types/index.ts`
- [ ] Ajouter la constante `DOCUMENT_CATEGORIES`
- [ ] Mettre à jour les types Supabase auto-générés

### Phase 3: Interface
- [ ] Ajouter le sélecteur de catégorie dans le formulaire d'ajout
- [ ] Ajouter le filtre par catégorie dans la section filtres
- [ ] Afficher la catégorie sur les cartes de documents
- [ ] Ajouter un badge "Auto-extrait" pour les liens de séances
- [ ] Ajouter un bouton "Voir la séance" pour les liens auto-extraits

### Phase 4: Tags (optionnel)
- [ ] Créer le composant `TagInput`
- [ ] Intégrer dans le formulaire d'ajout de document
- [ ] Afficher les tags sur les cartes
- [ ] Ajouter un filtre par tags

### Phase 5: Tests
- [ ] Vérifier que les catégories s'affichent correctement
- [ ] Vérifier que les filtres fonctionnent
- [ ] Vérifier que les liens auto-extraits ont le bon badge
- [ ] Vérifier que le lien vers la séance source fonctionne

## Estimation de temps

- Phase 1 (BDD): 15 minutes
- Phase 2 (Types): 10 minutes
- Phase 3 (Interface): 45 minutes
- Phase 4 (Tags): 30 minutes (optionnel)
- Phase 5 (Tests): 20 minutes

**Total**: ~2h (1h30 sans les tags)

## Notes importantes

1. **Rétrocompatibilité**: Tous les documents existants sans catégorie auront `category = null` → Afficher comme "Non catégorisé"

2. **Migration des liens existants**: Les liens déjà dans la table `liens` devront avoir `sourceType = 'auto-extracted'` par défaut

3. **UX**: Proposer des catégories suggérées basées sur le contenu lors de l'ajout (optionnel, IA)

4. **Performance**: Ajouter des index sur les colonnes `category` et `tags` pour les requêtes rapides

## Références

- Documentation actuelle: `DOCS_LIENS_CLIQUABLES.md`
- Session de travail: `DOCS_SESSION_2025-11-24.md`
- Composant actuel: `src/components/Documents.tsx`
- Types actuels: `src/types/index.ts`
- Hook liens: `src/hooks/useLiens.ts`

---

*TODO créé le 24 novembre 2025*
*À traiter lors d'une prochaine session*
