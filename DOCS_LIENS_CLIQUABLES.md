# Documentation - Système de liens cliquables

## Vue d'ensemble

Le système de liens cliquables a été implémenté dans le commit `ae477ec` (Version V2) pour transformer automatiquement les URLs en liens cliquables dans les bilans, commentaires et notes.

## Architecture du système

### Composants principaux

1. **RichTextEditor** (`src/components/RichTextEditor.tsx`)
   - Éditeur WYSIWYG avec détection automatique des URLs
   - Conversion en temps réel des URLs en liens cliquables
   - Extraction et notification des liens détectés

2. **RichTextViewer** (`src/components/RichTextViewer.tsx`)
   - Affichage sécurisé du HTML avec liens cliquables
   - Sanitization avec DOMPurify
   - Styles pour les liens (couleur, hover, visited)

3. **useLiens** (`src/hooks/useLiens.ts`)
   - Hook pour la gestion des liens en base de données
   - CRUD complet sur la table `liens`
   - Extraction automatique des titres depuis les URLs

---

## Fonctionnalité 1: Auto-détection des URLs

### Code - RichTextEditor.tsx (lignes 56-106)

```typescript
// Convert plain text URLs into clickable <a> tags and normalize them
const convertPlainUrlsToLinks = useCallback((html: string) => {
  const container = document.createElement('div');
  container.innerHTML = html;

  const urlRegex = /(https?:\/\/[^\s<]+)|(www\.[^\s<]+)/gi;

  const processNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (!urlRegex.test(text)) return;

      const parts = text.split(urlRegex).filter(Boolean);
      const frag = document.createDocumentFragment();

      parts.forEach((part) => {
        if (urlRegex.test(part)) {
          let href = part;
          // Ajouter https:// si manquant
          if (!/^https?:\/\//i.test(href)) {
            href = 'https://' + href;
          }
          const a = document.createElement('a');
          a.href = href;
          a.textContent = part;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          frag.appendChild(a);
        } else {
          frag.appendChild(document.createTextNode(part));
        }
      });

      node.parentNode?.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Don't process inside anchors
      if ((node as HTMLElement).tagName.toLowerCase() === 'a') return;
      Array.from(node.childNodes).forEach(processNode);
    }
  };

  Array.from(container.childNodes).forEach(processNode);

  // Ensure anchors have target and rel
  container.querySelectorAll('a[href]').forEach((a) => {
    const anchor = a as HTMLAnchorElement;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
  });

  return container.innerHTML;
}, []);
```

### Fonctionnement

1. **Détection par Regex:** `/(https?:\/\/[^\s<]+)|(www\.[^\s<]+)/gi`
   - Détecte `http://...` et `https://...`
   - Détecte `www....` (sera préfixé avec https://)

2. **Normalisation automatique:**
   - Si URL commence par `www.` → Ajoute `https://`
   - Si URL commence déjà par `http://` ou `https://` → Rien à faire

3. **Sécurité:**
   - Tous les liens ouvrent dans nouvel onglet (`target="_blank"`)
   - Protection avec `rel="noopener noreferrer"`

4. **Évite les doublons:**
   - Ne traite pas les URLs déjà dans des balises `<a>`

### Exemples de transformation

| Texte saisi | Lien généré |
|-------------|-------------|
| `https://example.com` | `<a href="https://example.com" target="_blank" rel="noopener noreferrer">https://example.com</a>` |
| `www.example.com` | `<a href="https://www.example.com" target="_blank" rel="noopener noreferrer">www.example.com</a>` |
| `http://example.com` | `<a href="http://example.com" target="_blank" rel="noopener noreferrer">http://example.com</a>` |

---

## Fonctionnalité 2: Affichage des liens

### Code - RichTextViewer.tsx (lignes 82-96)

```css
.rich-text-viewer .rich-text-content a {
  color: hsl(var(--primary));
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s ease;
}

.rich-text-viewer .rich-text-content a:hover {
  color: hsl(var(--primary) / 0.8);
  text-decoration: underline;
}

.rich-text-viewer .rich-text-content a:visited {
  color: hsl(var(--primary) / 0.7);
}
```

### Styles appliqués

- **Couleur normale:** Couleur primaire du thème (bleu par défaut)
- **Couleur hover:** 80% d'opacité de la couleur primaire
- **Couleur visited:** 70% d'opacité de la couleur primaire
- **Souligné:** Toujours souligné pour meilleure visibilité
- **Curseur:** Pointeur au survol
- **Transition:** Animation douce 0.2s sur le changement de couleur

### Sanitization (sécurité)

```typescript
const sanitizedHtml = DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['p', 'div', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'font'],
  ALLOWED_ATTR: ['class', 'href', 'target', 'rel', 'style', 'color', 'size'],
  ALLOWED_URI_REGEXP: /^https?:\/\/|^mailto:|^tel:/i,
  ADD_ATTR: ['style', 'color'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout'],
});
```

**Protocoles autorisés:**
- `https://` ✅
- `http://` ✅
- `mailto:` ✅
- `tel:` ✅
- `javascript:` ❌ (bloqué)
- `data:` ❌ (bloqué)

**Attributs interdits:**
- Tous les événements JavaScript (`onclick`, `onerror`, etc.)

---

## Fonctionnalité 3: Extraction des liens

### Code - RichTextEditor.tsx (lignes 49-54, 108-124)

```typescript
const extractLinks = useCallback((content: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const links = Array.from(tempDiv.querySelectorAll('a[href]')).map(a => (a as HTMLAnchorElement).href);
  return links;
}, []);

const handleInput = useCallback(() => {
  if (editorRef.current && onValueChange) {
    const original = editorRef.current.innerHTML;
    const linked = convertPlainUrlsToLinks(original);
    if (linked !== original) {
      editorRef.current.innerHTML = linked;
    }
    onValueChange(linked);
    updateActiveFormats();

    // Extract and notify about links
    if (onLinksExtracted) {
      const links = extractLinks(linked);
      onLinksExtracted([...new Set(links)]); // Dédoublonnage
    }
  }
}, [onValueChange, onLinksExtracted, extractLinks, convertPlainUrlsToLinks]);
```

### Fonctionnement

1. **À chaque modification** du contenu de l'éditeur:
   - Le HTML est parsé
   - Tous les liens `<a href="...">` sont extraits
   - Les doublons sont supprimés avec `new Set()`
   - Le callback `onLinksExtracted` est appelé

2. **Utilisation:** Permet de sauvegarder les liens dans une table séparée pour:
   - Indexation/recherche
   - Statistiques
   - Validation des liens morts
   - Suggestions de liens connexes

---

## Fonctionnalité 4: Création manuelle de liens

### Code - RichTextEditor.tsx (lignes 157-173)

```typescript
const createLink = useCallback(() => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const url = prompt('URL du lien:');
  if (url && url.trim()) {
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    executeCommand('createLink', finalUrl);
  }
}, [executeCommand]);

const removeLink = useCallback(() => {
  executeCommand('unlink');
}, [executeCommand]);
```

### Interface utilisateur

L'éditeur fournit deux boutons:
- **Bouton "Lien"** (icône Link): Transforme la sélection en lien
- **Bouton "Supprimer lien"** (icône Unlink): Retire le lien de la sélection

**Workflow:**
1. Utilisateur sélectionne du texte
2. Clique sur le bouton "Lien"
3. Prompt demande l'URL
4. URL normalisée (ajout https:// si besoin)
5. Texte transformé en `<a href="...">texte sélectionné</a>`

---

## Base de données - Table `liens`

### Structure (src/hooks/useLiens.ts)

```typescript
export interface Lien {
  id: string;
  user_id: string;
  url: string;
  title?: string;
  description?: string;
  source_type: string;  // 'seance', 'commentaire', 'document', etc.
  source_id: string;     // ID de la source
  created_at: string;
  updated_at: string;
}
```

### Hook useLiens - Fonctions

#### 1. fetchLiens()
```typescript
const fetchLiens = async () => {
  const { data, error } = await supabase
    .from('liens')
    .select('*')
    .order('created_at', { ascending: false });
  // ...
};
```

#### 2. saveLiens(urls, sourceType, sourceId)
```typescript
const saveLiens = async (urls: string[], sourceType: string, sourceId: string) => {
  // 1. Supprime les anciens liens de cette source
  await supabase
    .from('liens')
    .delete()
    .eq('source_type', sourceType)
    .eq('source_id', sourceId);

  // 2. Déduplique et filtre les URLs vides
  const uniqueUrls = [...new Set(urls.filter(url => url.trim()))];

  // 3. Insère les nouveaux liens
  const newLiens = uniqueUrls.map(url => ({
    user_id: user.id,
    url,
    source_type: sourceType,
    source_id: sourceId,
    title: extractTitleFromUrl(url)
  }));

  await supabase.from('liens').insert(newLiens);
};
```

#### 3. extractTitleFromUrl(url)
```typescript
const extractTitleFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '') + urlObj.pathname;
  } catch {
    return url;
  }
};
```

**Exemple:**
- URL: `https://www.example.com/page/article`
- Titre généré: `example.com/page/article`

---

## Utilisation dans les composants

### Exemple 1: Séances avec notes

```typescript
import { RichTextEditor } from '@/components/RichTextEditor';
import { useLiens } from '@/hooks/useLiens';

function SeanceForm() {
  const { saveLiens } = useLiens();
  const [notes, setNotes] = useState('');

  const handleLinksExtracted = (links: string[]) => {
    // Sauvegarde automatique des liens détectés
    saveLiens(links, 'seance', seanceId);
  };

  return (
    <RichTextEditor
      value={notes}
      onValueChange={setNotes}
      onLinksExtracted={handleLinksExtracted}
    />
  );
}
```

### Exemple 2: Commentaires avec affichage

```typescript
import { RichTextViewer } from '@/components/RichTextViewer';

function CommentaireDisplay({ commentaire }) {
  return (
    <div>
      <p>{commentaire.auteur}</p>
      <RichTextViewer html={commentaire.contenu} />
    </div>
  );
}
```

---

## Fonctionnalités supportées

### ✅ Ce qui fonctionne

1. **Auto-détection URLs:**
   - `https://example.com` → Lien cliquable
   - `www.example.com` → Lien cliquable (préfixe https://)
   - `http://example.com` → Lien cliquable

2. **Création manuelle:**
   - Sélectionner texte + bouton "Lien" → Lien personnalisé
   - Bouton "Supprimer lien" → Retire le lien

3. **Affichage sécurisé:**
   - Sanitization DOMPurify
   - Protection XSS
   - Bloque JavaScript dans les liens

4. **Styles:**
   - Couleur primaire du thème
   - Hover et visited states
   - Soulignement visible

5. **Extraction:**
   - Liste de tous les liens dans le contenu
   - Dédupliquage automatique
   - Sauvegarde en base de données

### ❌ Limitations connues

1. **Pas de prévisualisation:** Pas d'aperçu (thumbnail) des liens
2. **Pas de validation:** Les liens morts ne sont pas détectés
3. **Pas de métadonnées:** Pas d'extraction Open Graph/Twitter Cards
4. **Regex simple:** Peut manquer certaines URLs complexes avec parenthèses/etc.

---

## Tests et validation

### Cas de test pour l'auto-détection

| Test | Input | Output attendu |
|------|-------|----------------|
| URL HTTPS complète | `Voir https://example.com` | Lien cliquable sur `https://example.com` |
| URL avec www | `Aller sur www.google.fr` | Lien cliquable pointant vers `https://www.google.fr` |
| Plusieurs URLs | `Site 1: www.a.com et site 2: https://b.com` | 2 liens cliquables |
| URL déjà en lien | `<a href="...">texte</a>` | Pas de double lien |
| URL avec query params | `https://site.com?param=value&other=2` | Lien cliquable complet |
| URL avec fragment | `https://site.com/page#section` | Lien cliquable complet |

### Cas de test pour la sécurité

| Test | Input | Résultat attendu |
|------|-------|------------------|
| JavaScript dans href | `<a href="javascript:alert()">XSS</a>` | Lien bloqué par DOMPurify |
| Événement onclick | `<a onclick="alert()">Click</a>` | Attribut supprimé |
| Data URL | `<a href="data:text/html,...">Data</a>` | Lien bloqué |
| Tel protocol | `<a href="tel:+33123456789">Tel</a>` | ✅ Autorisé |
| Mailto protocol | `<a href="mailto:test@test.com">Mail</a>` | ✅ Autorisé |

---

## Améliorations futures possibles

### 1. Prévisualisation des liens
- Ajouter un tooltip avec le titre et description du site
- Utiliser une API comme OpenGraph pour récupérer les métadonnées
- Afficher une miniature du site

### 2. Validation des liens
- Vérifier périodiquement si les liens sont toujours valides (HTTP 200)
- Marquer les liens morts en rouge
- Proposer une redirection si le lien a changé

### 3. Raccourcisseur d'URL
- Intégrer un service de raccourcissement (type bit.ly)
- Pour les URLs très longues
- Tracking des clics

### 4. Suggestions intelligentes
- Détecter les mots-clés et suggérer des liens pertinents
- Historique des liens fréquemment utilisés
- Liens connexes basés sur le contexte

### 5. Amélioration de la regex
- Supporter les URLs avec parenthèses
- Supporter les URLs avec espaces encodés
- Détecter les URLs dans les formats Markdown `[texte](url)`

### 6. Interface de gestion
- Page dédiée à la gestion de tous les liens
- Recherche et filtrage
- Statistiques d'utilisation
- Export en CSV/JSON

---

## Dépannage

### Problème: Les liens ne deviennent pas cliquables

**Causes possibles:**
1. RichTextEditor non utilisé → Utiliser RichTextEditor au lieu de textarea
2. RichTextViewer non utilisé pour l'affichage → Utiliser RichTextViewer pour afficher le HTML
3. Contenu pas en HTML → Vérifier que le contenu est bien du HTML et pas du texte brut

**Solution:**
```typescript
// ❌ Mauvais
<textarea value={notes} />
<div>{notes}</div>

// ✅ Bon
<RichTextEditor value={notes} onValueChange={setNotes} />
<RichTextViewer html={notes} />
```

### Problème: Les liens sont bloqués par la sécurité

**Cause:** DOMPurify supprime le lien car protocole non autorisé

**Solution:** Vérifier `ALLOWED_URI_REGEXP` dans RichTextViewer.tsx (ligne 16)

### Problème: Les liens n'ouvrent pas dans un nouvel onglet

**Cause:** Attributs `target` et `rel` manquants

**Solution:** Vérifier que `convertPlainUrlsToLinks` ajoute bien:
```typescript
a.target = '_blank';
a.rel = 'noopener noreferrer';
```

---

## Commit de référence

**Commit:** `ae477ec` (14 septembre 2025)
**Titre:** Version V2 avec corrections: couleurs texte, avatars initiales, liens cliquables, réactions
**Auteur:** CodBad25 <mohamed.belhaj@ac-nantes.fr>

**Fichiers créés:**
- `src/components/RichTextEditor.tsx` (533 lignes)
- `src/components/RichTextViewer.tsx` (104 lignes)
- `src/hooks/useLiens.ts` (100 lignes)

**Fichiers utilisant le système:**
- `src/components/Commentaires.tsx`
- `src/components/Seances.tsx`
- `src/components/Documents.tsx`
- `src/components/SeanceForm.tsx`

---

## Code complet de référence

### Regex de détection des URLs
```typescript
const urlRegex = /(https?:\/\/[^\s<]+)|(www\.[^\s<]+)/gi;
```

### Normalisation des URLs
```typescript
let href = part;
if (!/^https?:\/\//i.test(href)) {
  href = 'https://' + href;
}
```

### Sanitization DOMPurify
```typescript
const sanitizedHtml = DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['p', 'div', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'font'],
  ALLOWED_ATTR: ['class', 'href', 'target', 'rel', 'style', 'color', 'size'],
  ALLOWED_URI_REGEXP: /^https?:\/\/|^mailto:|^tel:/i,
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout'],
});
```

---

*Documentation générée le 24 novembre 2025*
*Dernière mise à jour du code : commit ae477ec (14 septembre 2025)*
*Système de liens cliquables - Version 2*
