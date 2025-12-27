import React, { useState, useMemo } from 'react';
import {
  FileText,
  Link as LinkIcon,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Download,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Upload,
  BookOpen,
  ClipboardList,
  Wrench,
  FolderOpen,
  GraduationCap,
  Paperclip,
  Image,
  FileSpreadsheet,
  File,
  Globe,
  LayoutGrid,
  List,
  Sparkles,
  User as UserIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextAreaWithVoice } from '@/components/TextAreaWithVoice';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { useData } from '../context/DataContext';
import { Document } from '../types';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from './LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { useLiens } from '@/hooks/useLiens';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Catégories disponibles
const categories = [
  { id: 'pedagogie', name: 'Pédagogie', icon: BookOpen, color: 'bg-blue-500' },
  { id: 'administratif', name: 'Administratif', icon: ClipboardList, color: 'bg-amber-500' },
  { id: 'outils', name: 'Outils', icon: Wrench, color: 'bg-purple-500' },
  { id: 'ressources', name: 'Ressources', icon: FolderOpen, color: 'bg-green-500' },
  { id: 'formation', name: 'Formation', icon: GraduationCap, color: 'bg-rose-500' },
  { id: 'autre', name: 'Autre', icon: Paperclip, color: 'bg-gray-500' },
] as const;

type CategoryId = typeof categories[number]['id'];

// Fonction pour extraire le favicon d'une URL
const getFaviconUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
  } catch {
    return '';
  }
};

// Fonction pour obtenir une capture d'écran d'un site web
const getWebsitePreview = (url: string): string => {
  try {
    // Utilise thum.io (gratuit, pas de clé API requise)
    return `https://image.thum.io/get/width/400/crop/300/${encodeURIComponent(url)}`;
  } catch {
    return '';
  }
};

// Fonction pour obtenir un aperçu PDF via Google Docs
const getPdfPreview = (url: string): string => {
  try {
    // Google Docs viewer pour les PDFs
    return `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(url)}`;
  } catch {
    return '';
  }
};

// Vérifie si c'est un PDF
const isPdfUrl = (url: string): boolean => {
  return url?.toLowerCase().endsWith('.pdf') || url?.includes('/pdf') || false;
};

// Vérifie si c'est une image
const isImageUrl = (url: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const lowerUrl = url?.toLowerCase() || '';
  return imageExtensions.some(ext => lowerUrl.includes(ext));
};

// Fonction pour déterminer l'icône selon l'extension du fichier
const getFileIcon = (url: string, type: string) => {
  if (type === 'lien') return Globe;

  const ext = url?.split('.').pop()?.toLowerCase() || '';

  if (['pdf'].includes(ext)) return FileText;
  if (['doc', 'docx'].includes(ext)) return FileText;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheet;
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return Image;

  return File;
};

// Fonction pour vérifier si c'est récent (< 7 jours)
const isRecent = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays < 7;
};

interface DocumentFormData {
  titre: string;
  type: 'document' | 'lien' | 'upload';
  url: string;
  description: string;
  sharedWithPeers: boolean;
  category: CategoryId;
  file?: File;
}

const defaultFormData: DocumentFormData = {
  titre: '',
  type: 'upload',
  url: '',
  description: '',
  sharedWithPeers: true,
  category: 'autre',
  file: undefined,
};

export function Documents() {
  const { user } = useAuth();
  const { documents, addDocument, deleteDocument } = useData();
  const { liens, isLoading: liensLoading } = useLiens();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<DocumentFormData>(defaultFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);

  const isValidHttpUrl = (value: string) => {
    try {
      const u = new URL(value);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const errors = useMemo(() => {
    const errs: { titre?: string; url?: string; file?: string } = {};
    if (!formData.titre.trim()) {
      errs.titre = 'Le titre est requis';
    }
    if (formData.type === 'lien' || formData.type === 'document') {
      const u = formData.url.trim();
      if (!u) {
        errs.url = "L'URL est requise";
      } else if (!isValidHttpUrl(u)) {
        errs.url = 'Veuillez saisir une URL valide (http ou https)';
      }
    }
    if (formData.type === 'upload' && !formData.file) {
      errs.file = 'Veuillez sélectionner un fichier';
    }
    return errs;
  }, [formData]);

  const isFormValid = Object.keys(errors).length === 0;

  const combinedDocuments = useMemo(() => {
    const docs = [...documents];

    const lienDocs: Document[] = liens.map((l) => {
      let title = l.title;
      if (!title) {
        try {
          const u = new URL(l.url);
          title = u.hostname.replace('www.', '');
        } catch {
          title = l.url;
        }
      }
      return {
        id: `lien:${l.id}`,
        titre: title || l.url,
        type: 'lien',
        url: l.url,
        description: l.description || '',
        tuteurId: l.user_id,
        tuteurName: '',
        createdAt: l.created_at,
      } as Document;
    });

    // Dedupe by URL against existing 'lien' documents
    const existingLienUrls = new Set(
      docs.filter(d => d.type === 'lien' && d.url).map(d => d.url as string)
    );
    const filteredLienDocs = lienDocs.filter(ld => ld.url && !existingLienUrls.has(ld.url));

    return [...docs, ...filteredLienDocs];
  }, [documents, liens]);

  const filteredDocuments = useMemo(() => {
    return combinedDocuments.filter(document => {
      const matchesSearch = document.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           document.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (document.tuteurName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || document.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || (document as any).category === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [combinedDocuments, searchTerm, typeFilter, categoryFilter]);

  // Grouper les documents par catégorie
  const documentsByCategory = useMemo(() => {
    const grouped: Record<string, typeof filteredDocuments> = {};
    categories.forEach(cat => {
      grouped[cat.id] = filteredDocuments.filter(d => (d as any).category === cat.id);
    });
    // Documents sans catégorie vont dans "autre"
    const withoutCategory = filteredDocuments.filter(d => !(d as any).category);
    grouped['autre'] = [...(grouped['autre'] || []), ...withoutCategory];
    return grouped;
  }, [filteredDocuments]);

  const resetForm = () => {
    setFormData(defaultFormData);
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${user?.id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (error) {
      throw new Error(`Erreur upload: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Form data:', formData);
    
    if (!user) {
      console.error('No user found');
      toast.error('Utilisateur non connecté');
      return;
    }

    console.log('User found:', user);

    // Validation
    if (!formData.titre.trim()) {
      console.error('Title is empty');
      toast.error('Le titre est requis');
      return;
    }

    if (formData.type === 'lien' || formData.type === 'document') {
      const u = formData.url.trim();
      if (!u || !isValidHttpUrl(u)) {
        console.error('Invalid URL for link');
        toast.error("Une URL valide (http ou https) est requise pour un lien");
        return;
      }
    }

    if (formData.type === 'upload' && !formData.file) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setIsLoading(true);
    try {
      let finalUrl = formData.url;

      // Si c'est un upload, on upload le fichier d'abord
      if (formData.type === 'upload' && formData.file) {
        finalUrl = await uploadFile(formData.file);
      }

      const documentData = {
        titre: formData.titre,
        type: formData.type === 'upload' ? 'document' : formData.type,
        url: finalUrl,
        description: formData.description,
        tuteurId: user.id,
        tuteurName: user.name,
        sharedWithPeers: formData.sharedWithPeers,
        category: formData.category,
      };

      console.log('About to call addDocument with:', documentData);
      await addDocument(documentData); // ✅ Ajout du await
      console.log('addDocument call completed');

      toast.success('Document ajouté et partagé avec succès'); // ✅ Message amélioré
      setIsFormOpen(false);
      resetForm();
      console.log('=== FORM SUBMISSION COMPLETED ===');
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (document: Document) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        deleteDocument(document.id);
        toast.success('Document supprimé');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const canDelete = (document: Document) => {
    return user?.role === 'admin' || document.tuteurId === user?.id;
  };

  const handleOpenLink = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank');
    } else {
      window.open(`https://${url}`, '_blank');
    }
  };

  const getDocumentIcon = (type: 'document' | 'lien') => {
    return type === 'document' ? FileText : LinkIcon;
  };

  const getDocumentColor = (type: 'document' | 'lien') => {
    return type === 'document' 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  const handleTypeChange = (newType: 'document' | 'lien' | 'upload') => {
    console.log('Changing type to:', newType);
    setFormData(prev => ({ ...prev, type: newType, file: undefined, url: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Documents et liens
          </h1>
          <p className="text-muted-foreground">
            {filteredDocuments.length} ressource{filteredDocuments.length > 1 ? 's' : ''} partagée{filteredDocuments.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle vue grille/liste */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-2"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-2"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouveau document</DialogTitle>
              <DialogDescription>
                Partagez un document ou un lien utile pour la formation
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="titre">Titre</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
                  placeholder="Nom du document ou du lien"
                  required
                />
                {errors.titre && (
                  <p className="text-sm text-destructive mt-1">{errors.titre}</p>
                )}
              </div>

              <div>
                <Label>Type</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant={formData.type === 'upload' ? 'default' : 'outline'}
                    onClick={() => handleTypeChange('upload')}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Fichier
                  </Button>
                  <Button
                    type="button"
                    variant={formData.type === 'document' ? 'default' : 'outline'}
                    onClick={() => handleTypeChange('document')}
                    className="flex-1"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Document
                  </Button>
                  <Button
                    type="button"
                    variant={formData.type === 'lien' ? 'default' : 'outline'}
                    onClick={() => handleTypeChange('lien')}
                    className="flex-1"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Lien
                  </Button>
                </div>
              </div>

              {formData.type === 'upload' ? (
                <div>
                  <Label htmlFor="file">Fichier à uploader</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setFormData(prev => ({ ...prev, file }));
                    }}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  />
                  {errors.file && (
                    <p className="text-sm text-destructive mt-1">{errors.file}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Formats acceptés : PDF, Word, images, texte
                  </p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="url">
                    {formData.type === 'document' ? 'URL du document' : 'URL du lien'}
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder={formData.type === 'document' 
                      ? "https://exemple.com/document.pdf" 
                      : "https://exemple.com"
                    }
                  />
                  {errors.url && (
                    <p className="text-sm text-destructive mt-1">{errors.url}</p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="description">Description</Label>
                <TextAreaWithVoice
                  id="description"
                  value={formData.description}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                  placeholder="Décrivez le contenu et l'utilité de cette ressource..."
                  rows={4}
                />
              </div>

              {/* Sélecteur de catégorie */}
              <div>
                <Label>Catégorie</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {categories.map((cat) => {
                    const CatIcon = cat.icon;
                    const isSelected = formData.category === cat.id;
                    return (
                      <Button
                        key={cat.id}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() => setFormData(prev => ({ ...prev, category: cat.id as CategoryId }))}
                        className={cn(
                          "flex items-center justify-start gap-2 h-auto py-2",
                          isSelected && cat.color.replace('bg-', 'bg-') + ' hover:opacity-90'
                        )}
                        style={isSelected ? { backgroundColor: `var(--${cat.id}-color)` } : {}}
                      >
                        <CatIcon className="w-4 h-4" />
                        <span className="text-xs">{cat.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="sharedWithPeers"
                  checked={formData.sharedWithPeers}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sharedWithPeers: checked }))}
                />
                <Label htmlFor="sharedWithPeers">
                  Partager avec les autres tuteurs
                </Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading || !isFormValid}>
                  {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                  Ajouter
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="space-y-4">
        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-10 h-11"
            placeholder="Rechercher dans les titres, descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Chips de catégories */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('all')}
            className="rounded-full"
          >
            Tous
            <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
              {combinedDocuments.length}
            </Badge>
          </Button>
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            const count = documentsByCategory[cat.id]?.length || 0;
            const isActive = categoryFilter === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(cat.id)}
                className={cn(
                  "rounded-full",
                  isActive && `${cat.color} text-white border-transparent hover:opacity-90`
                )}
              >
                <CatIcon className="w-3.5 h-3.5 mr-1.5" />
                {cat.name}
                {count > 0 && (
                  <Badge
                    variant={isActive ? 'outline' : 'secondary'}
                    className={cn("ml-2 px-1.5 py-0 text-xs", isActive && "border-white/50 text-white")}
                  >
                    {count}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        {/* Filtres de type (Documents / Liens) */}
        <div className="flex gap-2">
          <Button
            variant={typeFilter === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTypeFilter('all')}
          >
            Tous types
          </Button>
          <Button
            variant={typeFilter === 'document' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTypeFilter('document')}
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Documents
          </Button>
          <Button
            variant={typeFilter === 'lien' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTypeFilter('lien')}
          >
            <Globe className="w-3.5 h-3.5 mr-1.5" />
            Liens
          </Button>
        </div>
      </div>

      {/* Documents List */}
      <div className={cn(
        viewMode === 'grid'
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "flex flex-col gap-3"
      )}>
        {filteredDocuments.length > 0 ? (
           filteredDocuments.map((document, index) => {
             const FileIcon = getFileIcon(document.url || '', document.type);
             const docCategory = categories.find(c => c.id === ((document as any).category || 'autre'));
             const CatIcon = docCategory?.icon || Paperclip;
             const faviconUrl = document.type === 'lien' && document.url ? getFaviconUrl(document.url) : '';
             const isNew = isRecent(document.createdAt);

             // Vue Liste
             if (viewMode === 'list') {
               return (
                 <Card key={document.id} className="hover:bg-accent/50 transition-colors group">
                   <div className="flex items-center p-4 gap-4">
                     {/* Icône/Favicon */}
                     <div className="flex-shrink-0">
                       {faviconUrl ? (
                         <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                           <img src={faviconUrl} alt="" className="w-6 h-6" onError={(e) => e.currentTarget.style.display = 'none'} />
                           <Globe className="w-5 h-5 text-muted-foreground hidden" />
                         </div>
                       ) : (
                         <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", docCategory?.color + '/20')}>
                           <FileIcon className={cn("w-5 h-5", docCategory?.color.replace('bg-', 'text-'))} />
                         </div>
                       )}
                     </div>

                     {/* Contenu */}
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2">
                         <h3 className="font-medium truncate">{document.titre}</h3>
                         {isNew && (
                           <Badge className="bg-emerald-500 text-white text-xs px-1.5 py-0">
                             <Sparkles className="w-3 h-3 mr-1" />
                             Nouveau
                           </Badge>
                         )}
                       </div>
                       <p className="text-sm text-muted-foreground truncate">{document.description}</p>
                       <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                         <Badge variant="outline" className="text-xs px-1.5 py-0">
                           <CatIcon className="w-3 h-3 mr-1" />
                           {docCategory?.name}
                         </Badge>
                         <span>•</span>
                         <span>{document.tuteurName || 'Inconnu'}</span>
                         <span>•</span>
                         <span>{format(parseISO(document.createdAt), 'dd/MM/yyyy', { locale: fr })}</span>
                       </div>
                     </div>

                     {/* Actions */}
                     <div className="flex items-center gap-2 flex-shrink-0">
                       {document.url && (
                         <Button variant="outline" size="sm" onClick={() => handleOpenLink(document.url)}>
                           <ExternalLink className="w-4 h-4" />
                         </Button>
                       )}
                       {canDelete(document) && (
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => handleDelete(document)}
                           className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       )}
                     </div>
                   </div>
                 </Card>
               );
             }

             // Vue Grille simple et épurée
             const url = document.url || '';
             const domainName = url ? (() => {
               try {
                 return new URL(url).hostname.replace('www.', '');
               } catch {
                 return '';
               }
             })() : '';

             // Couleur de bordure selon catégorie
             const borderColors: Record<string, string> = {
               'pedagogie': '#3b82f6',
               'administratif': '#f59e0b',
               'outils': '#a855f7',
               'ressources': '#22c55e',
               'formation': '#f43f5e',
               'autre': '#6b7280',
             };

             return (
              <Card
                key={document.id}
                className="hover:shadow-lg transition-all cursor-pointer group border-l-4"
                style={{ borderLeftColor: borderColors[(document as any).category || 'autre'] || '#6b7280' }}
                onClick={() => url && handleOpenLink(url)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    {/* Favicon ou icône */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${borderColors[(document as any).category || 'autre']}15` }}
                    >
                      {faviconUrl ? (
                        <img
                          src={faviconUrl}
                          alt=""
                          className="w-7 h-7"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            (e.currentTarget.nextSibling as HTMLElement)?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <FileIcon
                        className={cn("w-6 h-6", faviconUrl ? "hidden" : "")}
                        style={{ color: borderColors[(document as any).category || 'autre'] }}
                      />
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs px-1.5 py-0 flex-shrink-0">
                          {document.type === 'lien' ? 'Lien' : 'Doc'}
                        </Badge>
                        {isNew && (
                          <Badge className="bg-emerald-500 text-white text-xs px-1.5 py-0">
                            Nouveau
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                        {document.titre}
                      </CardTitle>
                      {domainName && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {domainName}
                        </p>
                      )}
                    </div>

                    {/* Menu */}
                    {canDelete(document) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); handleDelete(document); }}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>

                {document.description && (
                  <CardContent className="pt-0 pb-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {document.description}
                    </p>
                  </CardContent>
                )}

                <CardContent className={cn("pt-0 pb-4", !document.description && "pt-0")}>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3" />
                      {document.tuteurName || 'Inconnu'}
                    </span>
                    <span>{format(parseISO(document.createdAt), 'dd MMM yyyy', { locale: fr })}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full">
            <EmptyState
              title="Aucun document trouvé"
              description={searchTerm || typeFilter !== 'all' || categoryFilter !== 'all'
                ? "Aucun document ne correspond à vos critères de recherche"
                : "Commencez par partager votre premier document ou lien"
              }
              icon={FileText}
              action={!searchTerm && typeFilter === 'all' && categoryFilter === 'all' ? {
                label: "Ajouter un document",
                onClick: () => { resetForm(); setIsFormOpen(true); }
              } : undefined}
            />
          </div>
        )}
      </div>

    </div>
  );
}
