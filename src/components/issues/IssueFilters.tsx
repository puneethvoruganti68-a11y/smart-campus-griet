'use client';

import React, { useEffect, useState } from 'react';
import { IssueFilters as FilterType, IssueStatus, IssuePriority, IssueCategory } from '@/lib/types';
import { CATEGORY_CONFIG, PRIORITY_CONFIG, STATUS_CONFIG } from '@/lib/constants';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

interface IssueFiltersProps {
  filters: FilterType;
  onChange: (filters: FilterType) => void;
  isAdmin?: boolean;
}

export default function IssueFilters({ filters, onChange, isAdmin = false }: IssueFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch('/api/admin/meta').then(response => response.ok ? response.json() : { departments: [] })
      .then(data => setDepartments(data.departments || [])).catch(() => setDepartments([]));
  }, [isAdmin]);

  const handleFilterChange = (key: keyof FilterType, value: string) => {
    onChange({ ...filters, [key]: value === 'all' ? undefined : value });
  };

  const clearFilters = () => {
    onChange({ search: filters.search });
  };

  const activeFilterCount = ['status', 'priority', 'category', 'department', 'dateRange']
    .filter(k => filters[k as keyof FilterType] && filters[k as keyof FilterType] !== 'all')
    .length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets, titles, locations..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
              <select
                className="w-full p-2 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={filters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Priority</label>
              <select
                className="w-full p-2 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={filters.priority || 'all'}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="all">All Priorities</option>
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Category</label>
              <select
                className="w-full p-2 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={filters.category || 'all'}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="all">All Categories</option>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            {isAdmin && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Department</label>
                <select
                  className="w-full p-2 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={filters.department || 'all'}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {activeFilterCount > 0 && (
            <div className="flex justify-end mt-4">
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
