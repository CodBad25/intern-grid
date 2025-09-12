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
  Upload
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

interface DocumentFormData {
  titre: string;
  type: 'document' | 'lien' | 'upload';
  url: string;
  description: string;
  sharedWithPeers: boolean;
  file?: File;
}

const defaultFormData: DocumentFormData = {
  titre: '',
  type: 'upload',
  url: '',
  description: '',
  sharedWithPeers: true,
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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
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
      return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [combinedDocuments, searchTerm, typeFilter]);

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
      };

      console.log('About to call addDocument with:', documentData);
      addDocument(documentData);
      console.log('addDocument call completed');
      
      toast.success('Document ajouté avec succès');
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
            Partage de ressources et documents de formation
          </p>
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

      {/* Filters */}
      <Card>
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtres
              </div>
              <ChevronDown className={cn("w-4 h-4 transition-transform", isFiltersOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search">Rechercher</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="search"
                    className="pl-10"
                    placeholder="Rechercher dans les titres, descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="typeFilter">Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="lien">Liens</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.length > 0 ? (
           filteredDocuments.map((document, index) => {
             const Icon = getDocumentIcon(document.type as 'document' | 'lien');
             const isFromDocuments = documents.some(d => d.id === document.id);
             return (
              <Card key={document.id} className="hover-lift animate-fade-in group" style={{ animationDelay: `${index * 0.05}s` }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <Badge className={getDocumentColor(document.type as 'document' | 'lien')}>
                        {document.type === 'document' ? 'Document' : 'Lien'}
                      </Badge>
                    </div>
                    
                    {canDelete(document) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleDelete(document)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  
                  <div>
                    <CardTitle className="text-lg">{document.titre}</CardTitle>
                    <CardDescription className="text-sm">
                      Par {document.tuteurName || 'Utilisateur inconnu'} • {format(parseISO(document.createdAt), 'dd/MM/yyyy', { locale: fr })}
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {document.description}
                  </p>
                  
                  <div className="flex gap-2">
                    {document.url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleOpenLink(document.url)}
                        className="flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ouvrir
                      </Button>
                    )}
                    
                    {document.type === 'document' && document.url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenLink(document.url)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full">
            <EmptyState
              title="Aucun document trouvé"
              description={searchTerm || typeFilter !== 'all' 
                ? "Aucun document ne correspond à vos critères de recherche" 
                : "Commencez par partager votre premier document ou lien"
              }
              icon={FileText}
              action={!searchTerm && typeFilter === 'all' ? {
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
