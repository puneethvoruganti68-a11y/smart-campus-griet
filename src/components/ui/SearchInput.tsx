'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './Input';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onSearch: (value: string) => void;
  debounceMs?: number;
  initialValue?: string;
  containerClassName?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  debounceMs = 300,
  initialValue = '',
  containerClassName = '',
  placeholder = 'Search...',
  ...props
}) => {
  const [value, setValue] = useState(initialValue);

  // Update local value if initialValue changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Only fire if the value is different from initial or we're clearing
      if (value !== initialValue || value === '') {
         onSearch(value);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs, onSearch, initialValue]);

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className={`relative ${containerClassName}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        icon={<Search className="w-5 h-5" />}
        className={value ? 'pr-10' : ''}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
          aria-label="Clear search"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
