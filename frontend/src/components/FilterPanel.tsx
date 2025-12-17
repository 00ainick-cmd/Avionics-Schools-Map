import React from 'react';
import type { EntityType, School } from '../types';

interface Props {
  filters: {
    entityTypes: EntityType[];
    schoolTypes: School['type'][];
    searchQuery: string;
  };
  onFilterChange: (filters: {
    entityTypes: EntityType[];
    schoolTypes: School['type'][];
    searchQuery: string;
  }) => void;
  counts: {
    schools: number;
    military: number;
    aea: number;
  };
}

export default function FilterPanel({ filters, onFilterChange, counts }: Props) {
  const toggleEntityType = (type: EntityType) => {
    const newTypes = filters.entityTypes.includes(type)
      ? filters.entityTypes.filter(t => t !== type)
      : [...filters.entityTypes, type];
    onFilterChange({ ...filters, entityTypes: newTypes });
  };

  const toggleSchoolType = (type: School['type']) => {
    const newTypes = filters.schoolTypes.includes(type)
      ? filters.schoolTypes.filter(t => t !== type)
      : [...filters.schoolTypes, type];
    onFilterChange({ ...filters, schoolTypes: newTypes });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const clearFilters = () => {
    onFilterChange({
      entityTypes: ['school', 'military', 'aea'],
      schoolTypes: [],
      searchQuery: '',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Clear All
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by name, city, or state..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Entity Types */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Entity Types
        </label>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.entityTypes.includes('school')}
              onChange={() => toggleEntityType('school')}
              className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
              Schools ({counts.schools})
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.entityTypes.includes('military')}
              onChange={() => toggleEntityType('military')}
              className="mr-2 h-4 w-4 text-red-600 rounded focus:ring-red-500"
            />
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
              Military Bases ({counts.military})
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.entityTypes.includes('aea')}
              onChange={() => toggleEntityType('aea')}
              className="mr-2 h-4 w-4 text-green-600 rounded focus:ring-green-500"
            />
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              AEA Members ({counts.aea})
            </span>
          </label>
        </div>
      </div>

      {/* School Types */}
      {filters.entityTypes.includes('school') && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            School Types
          </label>
          <div className="space-y-2">
            {(['Part 147', 'Technical College', '4-Year Program', 'High School'] as School['type'][]).map(type => (
              <label key={type} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.schoolTypes.includes(type)}
                  onChange={() => toggleSchoolType(type)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Marker Legend</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-purple-600 mr-2"></span>
            Part 147
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-blue-600 mr-2"></span>
            Technical College
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-sky-600 mr-2"></span>
            4-Year Program
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-cyan-600 mr-2"></span>
            High School
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-red-600 mr-2"></span>
            Military Base
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-green-600 mr-2"></span>
            AEA Member
          </div>
        </div>
      </div>
    </div>
  );
}
