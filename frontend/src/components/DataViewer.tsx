import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTask, getTaskData } from '../services/api';
import { PropertyListing, TaskResponse } from '../types';

const DataViewer: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<TaskResponse | null>(null);
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  
  const [limit, setLimit] = useState(100);
  const [propertyType, setPropertyType] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [location, setLocation] = useState<string>('');
  
 
  const fetchData = async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      
      const taskData = await getTask(parseInt(taskId));
      setTask(taskData);
      
      if (taskData.status !== 'completed') {
        setError('This task is not yet completed. Please wait for it to finish processing.');
        setLoading(false);
        return;
      }
      
      
      const filters = {
        limit,
        property_type: propertyType || undefined,
        min_price: minPrice,
        max_price: maxPrice,
        location: location || undefined
      };
      
      const listingsData = await getTaskData(parseInt(taskId), filters);
      setListings(listingsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching task data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchData();
    
  }, [taskId]); 
  
 
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };
  
 
  const handleResetFilters = () => {
    setLimit(100);
    setPropertyType('');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setLocation('');
    
   
    setTimeout(fetchData, 0);
  };
  
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-t-4 border-b-4 border-primary-light dark:border-primary-dark rounded-full animate-spin"></div>
          <p className="mt-4 text-text-light dark:text-text-dark">Loading data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-4 rounded-lg mb-4 shadow-soft transition-colors duration-300">
        <p>{error}</p>
        <button 
          onClick={fetchData} 
          className="mt-2 bg-red-600 dark:bg-red-700 text-white px-4 py-1 rounded hover:bg-red-700 dark:hover:bg-red-800 transition-colors duration-300"
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (!task) {
    return <div className="text-center py-8 text-text-light dark:text-text-dark">Task not found</div>;
  }
  
  return (
    <div>
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-soft-lg transition-colors duration-300">
        <h2 className="text-xl font-bold mb-4 text-text-light dark:text-text-dark flex items-center">
          <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          Data for Task: {task.name} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">(ID: {task.id})</span>
        </h2>
        
       
        <form onSubmit={handleApplyFilters} className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                Property Type
              </label>
              <select
                className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:outline-none transition-colors duration-200"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Condo">Condo</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Duplex">Duplex</option>
                <option value="Loft">Loft</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                Min Price
              </label>
              <input
                type="number"
                className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:outline-none transition-colors duration-200"
                value={minPrice || ''}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Min Price"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                Max Price
              </label>
              <input
                type="number"
                className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:outline-none transition-colors duration-200"
                value={maxPrice || ''}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Max Price"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                Location
              </label>
              <input
                type="text"
                className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:outline-none transition-colors duration-200"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Search by location..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                Limit Results
              </label>
              <input
                type="number"
                className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:outline-none transition-colors duration-200"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                min="1"
                max="1000"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Reset Filters
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded hover:bg-opacity-90 transition-colors duration-200"
            >
              Apply Filters
            </button>
          </div>
        </form>
        
        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
          Showing {listings.length} results
        </div>
        
        {/* Data Table */}
        {listings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-card-light dark:bg-card-dark transition-colors duration-300">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Source</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Beds</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Baths</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Sq.Ft.</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                </tr>
              </thead>
              <tbody>
                {listings.map(listing => (
                  <tr key={`${listing.data_source}-${listing.property_id}`} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300">
                    <td className="py-3 px-4 text-text-light dark:text-text-dark">{listing.property_id}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        listing.data_source === 'source_a' 
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100'
                          : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                      } transition-colors duration-300`}>
                        {listing.data_source === 'source_a' ? 'Source A' : 'Source B'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-light dark:text-text-dark">{listing.location}</td>
                    <td className="py-3 px-4 text-text-light dark:text-text-dark">{listing.property_type}</td>
                    <td className="py-3 px-4 font-medium text-text-light dark:text-text-dark">{formatPrice(listing.price)}</td>
                    <td className="py-3 px-4 text-text-light dark:text-text-dark">{listing.bedrooms}</td>
                    <td className="py-3 px-4 text-text-light dark:text-text-dark">{listing.bathrooms}</td>
                    <td className="py-3 px-4 text-text-light dark:text-text-dark">{listing.square_feet}</td>
                    <td className="py-3 px-4 text-text-light dark:text-text-dark">{listing.listing_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-200">
            No listings found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default DataViewer; 