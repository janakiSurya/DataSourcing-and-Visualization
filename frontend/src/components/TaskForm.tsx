import React, { useState } from 'react';
import { createTask } from '../services/api';
import { TaskCreate, SourceAFilter, SourceBFilter } from '../types';

interface TaskFormProps {
  onTaskCreated: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated }) => {
  const [name, setName] = useState('');
  const [sourceAEnabled, setSourceAEnabled] = useState(true);
  const [sourceBEnabled, setSourceBEnabled] = useState(true);
  const [showSourceAFilters, setShowSourceAFilters] = useState(false);
  const [showSourceBFilters, setShowSourceBFilters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Source A Filters
  const [sourceAFilters, setSourceAFilters] = useState<SourceAFilter>({
    min_price: undefined,
    max_price: undefined,
    property_types: [],
    locations: [],
    min_listing_date: undefined,
    max_listing_date: undefined
  });
  
  // Source B Filters
  const [sourceBFilters, setSourceBFilters] = useState<SourceBFilter>({
    min_price: undefined,
    max_price: undefined,
    property_types: [],
    locations: [],
    min_bedrooms: undefined,
    max_bedrooms: undefined
  });
  
  
  const propertyTypes = ["Apartment", "House", "Condo", "Townhouse", "Duplex", "Loft"];
  
 
  const sourceALocations = ["San Francisco", "New York", "Boston", "Chicago", "Seattle", "Austin", "Denver"];
  const sourceBLocations = ["Los Angeles", "Miami", "Portland", "Dallas", "Atlanta", "San Diego", "Phoenix"];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Please enter a task name');
      return;
    }
    
    if (!sourceAEnabled && !sourceBEnabled) {
      alert('Please enable at least one data source');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const taskData: TaskCreate = {
        name,
        source_a_enabled: sourceAEnabled,
        source_b_enabled: sourceBEnabled,
        source_a_filters: sourceAEnabled && showSourceAFilters ? sourceAFilters : undefined,
        source_b_filters: sourceBEnabled && showSourceBFilters ? sourceBFilters : undefined
      };
      
      await createTask(taskData);
      setName('');
      setSourceAEnabled(true);
      setSourceBEnabled(true);
      setShowSourceAFilters(false);
      setShowSourceBFilters(false);
      
      // Reset filters
      setSourceAFilters({
        min_price: undefined,
        max_price: undefined,
        property_types: [],
        locations: [],
        min_listing_date: undefined,
        max_listing_date: undefined
      });
      
      setSourceBFilters({
        min_price: undefined,
        max_price: undefined,
        property_types: [],
        locations: [],
        min_bedrooms: undefined,
        max_bedrooms: undefined
      });
      
      onTaskCreated();
      
      
      const successElement = document.getElementById('form-success-message');
      if (successElement) {
        successElement.classList.remove('hidden');
        setTimeout(() => {
          successElement.classList.add('hidden');
        }, 3000);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  const handleSourceAPropertyTypeChange = (type: string) => {
    setSourceAFilters(prev => {
      const current = prev.property_types || [];
      if (current.includes(type)) {
        return {
          ...prev,
          property_types: current.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          property_types: [...current, type]
        };
      }
    });
  };
  
  
  const handleSourceBPropertyTypeChange = (type: string) => {
    setSourceBFilters(prev => {
      const current = prev.property_types || [];
      if (current.includes(type)) {
        return {
          ...prev,
          property_types: current.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          property_types: [...current, type]
        };
      }
    });
  };
  
  
  const handleSourceALocationChange = (location: string) => {
    setSourceAFilters(prev => {
      const current = prev.locations || [];
      if (current.includes(location)) {
        return {
          ...prev,
          locations: current.filter(l => l !== location)
        };
      } else {
        return {
          ...prev,
          locations: [...current, location]
        };
      }
    });
  };
  
  
  const handleSourceBLocationChange = (location: string) => {
    setSourceBFilters(prev => {
      const current = prev.locations || [];
      if (current.includes(location)) {
        return {
          ...prev,
          locations: current.filter(l => l !== location)
        };
      } else {
        return {
          ...prev,
          locations: [...current, location]
        };
      }
    });
  };
  
  return (
    <div>
     
      <div id="form-success-message" className="hidden mb-4 p-4 rounded-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 shadow-soft transition-all duration-300">
        Task created successfully! Processing will begin shortly.
      </div>
      
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-soft-lg transition-colors duration-300">
        <h2 className="text-xl font-bold mb-4 text-text-light dark:text-text-dark flex items-center">
          <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Create New Data Task
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-text-light dark:text-text-dark mb-2 font-medium" htmlFor="name">
              Task Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:outline-none transition-colors duration-200"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a descriptive name for your task"
              required
            />
          </div>
          
        
          <div className="mb-6 p-5 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center text-text-light dark:text-text-dark">
                <input
                  type="checkbox"
                  checked={sourceAEnabled}
                  onChange={() => setSourceAEnabled(!sourceAEnabled)}
                  className="mr-3 h-4 w-4 text-primary-light dark:text-primary-dark rounded focus:ring-primary-light dark:focus:ring-primary-dark"
                />
                <span className="font-medium">Enable Source A (JSON)</span>
              </label>
              {sourceAEnabled && (
                <button
                  type="button"
                  className="flex items-center text-primary-light dark:text-primary-dark hover:underline font-medium text-sm transition-colors duration-200"
                  onClick={() => setShowSourceAFilters(!showSourceAFilters)}
                >
                  {showSourceAFilters ? (
                    <>
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                      Hide Filters
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                      Show Filters
                    </>
                  )}
                </button>
              )}
            </div>
            
            {sourceAEnabled && showSourceAFilters && (
              <div className="mt-4 pl-5 border-l-2 border-primary-light dark:border-primary-dark animate-fade-in transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Min Price</label>
                    <input
                      type="number"
                      className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-text-light dark:text-text-dark focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark focus:outline-none transition-colors duration-200"
                      value={sourceAFilters.min_price || ''}
                      onChange={(e) => setSourceAFilters({
                        ...sourceAFilters,
                        min_price: e.target.value ? Number(e.target.value) : undefined
                      })}
                      placeholder="Minimum price"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Max Price</label>
                    <input
                      type="number"
                      className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-text-light dark:text-text-dark focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark focus:outline-none transition-colors duration-200"
                      value={sourceAFilters.max_price || ''}
                      onChange={(e) => setSourceAFilters({
                        ...sourceAFilters,
                        max_price: e.target.value ? Number(e.target.value) : undefined
                      })}
                      placeholder="Maximum price"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Min Listing Date</label>
                    <input
                      type="date"
                      className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-text-light dark:text-text-dark focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark focus:outline-none transition-colors duration-200"
                      value={sourceAFilters.min_listing_date || ''}
                      onChange={(e) => setSourceAFilters({
                        ...sourceAFilters,
                        min_listing_date: e.target.value || undefined
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Max Listing Date</label>
                    <input
                      type="date"
                      className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-text-light dark:text-text-dark focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark focus:outline-none transition-colors duration-200"
                      value={sourceAFilters.max_listing_date || ''}
                      onChange={(e) => setSourceAFilters({
                        ...sourceAFilters,
                        max_listing_date: e.target.value || undefined
                      })}
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Property Types</label>
                  <div className="flex flex-wrap gap-2">
                    {propertyTypes.map(type => (
                      <label key={`a-${type}`} className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <input
                          type="checkbox"
                          className="mr-1.5 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark"
                          checked={sourceAFilters.property_types?.includes(type) || false}
                          onChange={() => handleSourceAPropertyTypeChange(type)}
                        />
                        <span className="text-sm text-text-light dark:text-text-dark">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Locations</label>
                  <div className="flex flex-wrap gap-2">
                    {sourceALocations.map(location => (
                      <label key={`a-${location}`} className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <input
                          type="checkbox"
                          className="mr-1.5 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark"
                          checked={sourceAFilters.locations?.includes(location) || false}
                          onChange={() => handleSourceALocationChange(location)}
                        />
                        <span className="text-sm text-text-light dark:text-text-dark">{location}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          
          <div className="mb-6 p-5 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center text-text-light dark:text-text-dark">
                <input
                  type="checkbox"
                  checked={sourceBEnabled}
                  onChange={() => setSourceBEnabled(!sourceBEnabled)}
                  className="mr-3 h-4 w-4 text-secondary-light dark:text-secondary-dark rounded focus:ring-secondary-light dark:focus:ring-secondary-dark"
                />
                <span className="font-medium">Enable Source B (CSV)</span>
              </label>
              {sourceBEnabled && (
                <button
                  type="button"
                  className="flex items-center text-secondary-light dark:text-secondary-dark hover:underline font-medium text-sm transition-colors duration-200"
                  onClick={() => setShowSourceBFilters(!showSourceBFilters)}
                >
                  {showSourceBFilters ? (
                    <>
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                      Hide Filters
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                      Show Filters
                    </>
                  )}
                </button>
              )}
            </div>
            
            {sourceBEnabled && showSourceBFilters && (
              <div className="mt-4 pl-5 border-l-2 border-secondary-light dark:border-secondary-dark animate-fade-in transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Min Price</label>
                    <input
                      type="number"
                      className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-text-light dark:text-text-dark focus:ring-1 focus:ring-secondary-light dark:focus:ring-secondary-dark focus:outline-none transition-colors duration-200"
                      value={sourceBFilters.min_price || ''}
                      onChange={(e) => setSourceBFilters({
                        ...sourceBFilters,
                        min_price: e.target.value ? Number(e.target.value) : undefined
                      })}
                      placeholder="Minimum price"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Max Price</label>
                    <input
                      type="number"
                      className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-text-light dark:text-text-dark focus:ring-1 focus:ring-secondary-light dark:focus:ring-secondary-dark focus:outline-none transition-colors duration-200"
                      value={sourceBFilters.max_price || ''}
                      onChange={(e) => setSourceBFilters({
                        ...sourceBFilters,
                        max_price: e.target.value ? Number(e.target.value) : undefined
                      })}
                      placeholder="Maximum price"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Min Bedrooms</label>
                    <input
                      type="number"
                      className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-text-light dark:text-text-dark focus:ring-1 focus:ring-secondary-light dark:focus:ring-secondary-dark focus:outline-none transition-colors duration-200"
                      value={sourceBFilters.min_bedrooms || ''}
                      onChange={(e) => setSourceBFilters({
                        ...sourceBFilters,
                        min_bedrooms: e.target.value ? Number(e.target.value) : undefined
                      })}
                      placeholder="Minimum bedrooms"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Max Bedrooms</label>
                    <input
                      type="number"
                      className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-text-light dark:text-text-dark focus:ring-1 focus:ring-secondary-light dark:focus:ring-secondary-dark focus:outline-none transition-colors duration-200"
                      value={sourceBFilters.max_bedrooms || ''}
                      onChange={(e) => setSourceBFilters({
                        ...sourceBFilters,
                        max_bedrooms: e.target.value ? Number(e.target.value) : undefined
                      })}
                      placeholder="Maximum bedrooms"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Property Types</label>
                  <div className="flex flex-wrap gap-2">
                    {propertyTypes.map(type => (
                      <label key={`b-${type}`} className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <input
                          type="checkbox"
                          className="mr-1.5 text-secondary-light dark:text-secondary-dark focus:ring-secondary-light dark:focus:ring-secondary-dark"
                          checked={sourceBFilters.property_types?.includes(type) || false}
                          onChange={() => handleSourceBPropertyTypeChange(type)}
                        />
                        <span className="text-sm text-text-light dark:text-text-dark">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Locations</label>
                  <div className="flex flex-wrap gap-2">
                    {sourceBLocations.map(location => (
                      <label key={`b-${location}`} className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <input
                          type="checkbox"
                          className="mr-1.5 text-secondary-light dark:text-secondary-dark focus:ring-secondary-light dark:focus:ring-secondary-dark"
                          checked={sourceBFilters.locations?.includes(location) || false}
                          onChange={() => handleSourceBLocationChange(location)}
                        />
                        <span className="text-sm text-text-light dark:text-text-dark">{location}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center px-6 py-3 bg-primary-light dark:bg-primary-dark hover:bg-opacity-90 text-white font-medium rounded-md transition-all duration-300 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm; 