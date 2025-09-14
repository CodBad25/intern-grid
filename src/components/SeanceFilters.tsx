import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Filter, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SeanceFiltersProps {
  isFiltersOpen: boolean;
  setIsFiltersOpen: (isOpen: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  selectableSeanceTypes: { value: string; label: string }[];
}

export function SeanceFilters({
  isFiltersOpen,
  setIsFiltersOpen,
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  selectableSeanceTypes,
}: SeanceFiltersProps) {
  return (
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
                  placeholder="Rechercher dans les notes ou tuteur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="typeFilter">Type de séance</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {selectableSeanceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
