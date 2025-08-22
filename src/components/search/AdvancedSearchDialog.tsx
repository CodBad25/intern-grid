
import React, { useState } from 'react';
import { Search, Filter, Calendar, Tag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface SearchCriteria {
  query: string;
  contentType: string;
  dateRange: string;
  tags: string[];
  author: string;
}

export function AdvancedSearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    query: '',
    contentType: 'all',
    dateRange: 'all',
    tags: [],
    author: ''
  });

  const updateCriteria = (updates: Partial<SearchCriteria>) => {
    setSearchCriteria(prev => ({ ...prev, ...updates }));
  };

  const performSearch = async () => {
    setIsSearching(true);
    // Ici on pourrait implémenter la recherche réelle
    // Pour l'instant, on simule juste une recherche
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSearching(false);
  };

  const handleSearch = async () => {
    await performSearch();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span>Recherche avancée</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Recherche avancée</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recherche textuelle */}
          <div className="space-y-2">
            <Label htmlFor="search-text">Recherche textuelle</Label>
            <Input
              id="search-text"
              placeholder="Mots-clés, contenu..."
              value={searchCriteria.query}
              onChange={(e) => updateCriteria({ query: e.target.value })}
            />
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type de contenu</Label>
              <Select
                value={searchCriteria.contentType}
                onValueChange={(value) => updateCriteria({ contentType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="seances">Séances</SelectItem>
                  <SelectItem value="commentaires">Commentaires</SelectItem>
                  <SelectItem value="documents">Documents</SelectItem>
                  <SelectItem value="evenements">Événements</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Période</Label>
              <Select
                value={searchCriteria.dateRange}
                onValueChange={(value) => updateCriteria({ dateRange: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toute période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toute période</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags et auteur */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Séparer par des virgules"
                value={searchCriteria.tags.join(', ')}
                onChange={(e) => updateCriteria({ 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Auteur</Label>
              <Input
                id="author"
                placeholder="Nom de l'auteur"
                value={searchCriteria.author}
                onChange={(e) => updateCriteria({ author: e.target.value })}
              />
            </div>
          </div>

          {/* Critères actifs */}
          {(searchCriteria.query || searchCriteria.contentType !== 'all' || 
            searchCriteria.dateRange !== 'all' || searchCriteria.tags.length || 
            searchCriteria.author) && (
            <div className="space-y-2">
              <Label>Critères actifs</Label>
              <div className="flex flex-wrap gap-2">
                {searchCriteria.query && (
                  <Badge variant="outline">
                    <Search className="w-3 h-3 mr-1" />
                    "{searchCriteria.query}"
                  </Badge>
                )}
                {searchCriteria.contentType !== 'all' && (
                  <Badge variant="outline">
                    <Filter className="w-3 h-3 mr-1" />
                    {searchCriteria.contentType}
                  </Badge>
                )}
                {searchCriteria.dateRange !== 'all' && (
                  <Badge variant="outline">
                    <Calendar className="w-3 h-3 mr-1" />
                    {searchCriteria.dateRange}
                  </Badge>
                )}
                {searchCriteria.tags.map(tag => (
                  <Badge key={tag} variant="outline">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {searchCriteria.author && (
                  <Badge variant="outline">
                    <User className="w-3 h-3 mr-1" />
                    {searchCriteria.author}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                updateCriteria({
                  query: '',
                  contentType: 'all',
                  dateRange: 'all',
                  tags: [],
                  author: ''
                });
              }}
            >
              Réinitialiser
            </Button>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Recherche...' : 'Rechercher'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
