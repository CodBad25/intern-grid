import { useState, useMemo, useCallback } from 'react';

export interface SearchFilter {
  key: string;
  label: string;
  active: boolean;
}

export interface SearchOptions {
  searchTerm: string;
  filters: SearchFilter[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useAdvancedSearch<T>(
  data: T[],
  searchFields: (keyof T)[],
  availableFilters: Omit<SearchFilter, 'active'>[] = []
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>(
    availableFilters.map(filter => ({ ...filter, active: false }))
  );
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const toggleFilter = useCallback((filterKey: string) => {
    setFilters(prev => 
      prev.map(filter => 
        filter.key === filterKey 
          ? { ...filter, active: !filter.active }
          : filter
      )
    );
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(prev => prev.map(filter => ({ ...filter, active: false })));
    setSearchTerm('');
  }, []);

  const filteredData = useMemo(() => {
    let result = data;

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        searchFields.some(field => {
          const value = item[field];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(term);
          }
          if (typeof value === 'number') {
            return value.toString().includes(term);
          }
          return false;
        })
      );
    }

    // Apply active filters (cette logique dépendra du type de données)
    const activeFilters = filters.filter(f => f.active);
    if (activeFilters.length > 0) {
      // Cette partie devra être customisée selon les besoins spécifiques
      result = result.filter(item => {
        return activeFilters.every(filter => {
          // Logique de filtrage à implémenter selon le type de données
          return true;
        });
      });
    }

    // Apply sorting
    if (sortBy) {
      result = [...result].sort((a, b) => {
        const aValue = (a as any)[sortBy];
        const bValue = (b as any)[sortBy];
        
        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;
        
        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [data, searchTerm, searchFields, filters, sortBy, sortOrder]);

  const suggestions = useMemo(() => {
    if (!searchTerm) return [];
    
    const uniqueSuggestions = new Set<string>();
    
    data.forEach(item => {
      searchFields.forEach(field => {
        const value = item[field];
        if (typeof value === 'string') {
          const words = value.toLowerCase().split(/\s+/);
          words.forEach(word => {
            if (word.includes(searchTerm.toLowerCase()) && word !== searchTerm.toLowerCase()) {
              uniqueSuggestions.add(word);
            }
          });
        }
      });
    });

    return Array.from(uniqueSuggestions).slice(0, 5);
  }, [data, searchFields, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    toggleFilter,
    resetFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredData,
    suggestions,
    searchOptions: {
      searchTerm,
      filters,
      sortBy,
      sortOrder
    } as SearchOptions
  };
}