// src/components/forms/SearchInput.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  className?: string;
  defaultValue?: string;
}

export function SearchInput({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  className,
  defaultValue = ''
}: SearchInputProps) {
  const [query, setQuery] = useState(defaultValue);
  const debouncedQuery = useDebounce(query, debounceMs);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 pr-10"
      />
      {query && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-4 w-4 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}