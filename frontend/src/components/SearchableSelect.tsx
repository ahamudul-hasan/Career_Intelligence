import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface SearchableOption {
  value: string | number;
  label: string;
  subLabel?: string;
  category?: string;
}

interface SearchableSelectProps {
  options: SearchableOption[];
  value: string | number | null | undefined;
  onChange: (value: any) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  allowClear?: boolean;
  emptyMessage?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '-- Select an option --',
  searchPlaceholder = 'Type to search or scroll...',
  disabled = false,
  className = '',
  id,
  allowClear = false,
  emptyMessage = 'No matching options found',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    if (value === null || value === undefined || value === '') return null;
    return options.find((opt) => String(opt.value) === String(value)) || null;
  }, [options, value]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return options;
    return options.filter((opt) => {
      const labelMatch = opt.label.toLowerCase().includes(q);
      const subLabelMatch = opt.subLabel ? opt.subLabel.toLowerCase().includes(q) : false;
      const categoryMatch = opt.category ? opt.category.toLowerCase().includes(q) : false;
      return labelMatch || subLabelMatch || categoryMatch;
    });
  }, [options, searchQuery]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle key down in search box (Escape to close, Enter to pick first item)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        onChange(filteredOptions[0].value);
        setIsOpen(false);
      }
    }
  };

  const handleSelect = (optValue: string | number) => {
    onChange(optValue);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative select-none ${isOpen ? 'z-50' : 'z-0'} ${className}`}>
      {/* Trigger Button */}
      <div
        id={id}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border transition-all flex items-center justify-between text-xs cursor-pointer ${
          disabled
            ? 'opacity-50 cursor-not-allowed border-slate-800 text-slate-500'
            : isOpen
            ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)] text-white'
            : 'border-slate-800 text-slate-200 hover:border-slate-700 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden truncate mr-2">
          {selectedOption ? (
            <>
              <span className="font-medium text-slate-100 truncate">{selectedOption.label}</span>
              {(selectedOption.subLabel || selectedOption.category) && (
                <span className="text-[10px] text-cyan-400/90 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-md flex-shrink-0">
                  {selectedOption.subLabel || selectedOption.category}
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-500 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {allowClear && selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-cyan-400' : ''
            }`}
          />
        </div>
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[100] bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-2.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
          {/* Integrated Search Box */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-7 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Subheader status */}
          <div className="flex items-center justify-between px-1.5 pb-1.5 text-[10px] text-slate-400 font-medium border-b border-slate-800/80">
            <span>
              {searchQuery ? `Matching: ${filteredOptions.length} of ${options.length}` : `All items (${options.length})`}
            </span>
            <span className="text-slate-500">Scroll or type</span>
          </div>

          {/* Scrollable Options List */}
          <div className="max-h-56 overflow-y-auto mt-1 space-y-1 pr-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = selectedOption && String(selectedOption.value) === String(opt.value);
                return (
                  <div
                    key={String(opt.value)}
                    onClick={() => handleSelect(opt.value)}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 font-medium'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate mr-2">
                      <span className="truncate">{opt.label}</span>
                      {(opt.subLabel || opt.category) && (
                        <span className="text-[10px] text-slate-400 bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-700/60 flex-shrink-0">
                          {opt.subLabel || opt.category}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 ml-2" />}
                  </div>
                );
              })
            ) : (
              <div className="py-6 px-3 text-center">
                <p className="text-xs text-slate-400 mb-1">{emptyMessage}</p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-[11px] text-cyan-400 hover:underline mt-1"
                  >
                    Clear search query
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
