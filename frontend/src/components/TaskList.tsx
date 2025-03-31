import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTasks, deleteTask } from '../services/api';
import { TaskResponse } from '../types';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  
  
  const statusColors = {
    pending: {
      light: 'bg-yellow-100 text-yellow-800',
      dark: 'bg-yellow-900 text-yellow-100'
    },
    in_progress: {
      light: 'bg-blue-100 text-blue-800',
      dark: 'bg-blue-900 text-blue-100'
    },
    completed: {
      light: 'bg-green-100 text-green-800',
      dark: 'bg-green-900 text-green-100'
    },
    failed: {
      light: 'bg-red-100 text-red-800',
      dark: 'bg-red-900 text-red-100'
    }
  };
  
 
  const fetchTasks = async () => {
    try {
      const tasksData = await getTasks();
      
      tasksData.sort((a, b) => b.id - a.id);
      setTasks(tasksData);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  
  useEffect(() => {
    fetchTasks();
    
    
    const intervalId = setInterval(fetchTasks, 3000);
    
    
    return () => clearInterval(intervalId);
  }, []);
 
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (err) {
      console.error('Error formatting date:', err);
      return dateString;
    }
  };
  
  
  const handleDeleteTask = async (taskId: number) => {
    setIsDeleting(taskId);
    try {
      await deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
     
      const successElement = document.getElementById('success-message');
      if (successElement) {
        successElement.classList.remove('hidden');
        setTimeout(() => {
          successElement.classList.add('hidden');
        }, 3000);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(null);
      setConfirmDelete(null);
    }
  };
  
  
  const askDeleteConfirmation = (taskId: number) => {
    setConfirmDelete(taskId);
  };
  
  
  const cancelDelete = () => {
    setConfirmDelete(null);
  };
  
  
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-t-4 border-b-4 border-primary-light dark:border-primary-dark rounded-full animate-spin"></div>
          <p className="mt-4 text-text-light dark:text-text-dark">Loading tasks...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-4 rounded-lg mb-4 shadow-soft transition-colors duration-300">
        <p>{error}</p>
        <button 
          onClick={fetchTasks} 
          className="mt-2 bg-red-600 dark:bg-red-700 text-white px-4 py-1 rounded hover:bg-red-700 dark:hover:bg-red-800 transition-colors duration-300"
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-card-light dark:bg-card-dark rounded-lg shadow-soft transition-colors duration-300">
        <svg 
          className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="mt-4 text-text-light dark:text-text-dark text-lg">No tasks created yet. Create your first task above!</p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Success message for deletion */}
      <div id="success-message" className="hidden mb-4 p-4 rounded-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 shadow-soft transition-all duration-300">
        Task successfully deleted!
      </div>
      
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-soft-lg transition-colors duration-300">
        <h2 className="text-xl font-bold mb-4 text-text-light dark:text-text-dark flex items-center">
          <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Your Tasks
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-card-light dark:bg-card-dark transition-colors duration-300">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Created</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Completed</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr 
                  key={task.id} 
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
                >
                  <td className="py-3 px-4 text-text-light dark:text-text-dark">{task.id}</td>
                  <td className="py-3 px-4 text-text-light dark:text-text-dark font-medium">{task.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors[task.status as keyof typeof statusColors]?.[
                        document.documentElement.classList.contains('dark') ? 'dark' : 'light'
                      ] || 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {getStatusDisplay(task.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-light dark:text-text-dark">{formatDate(task.created_at)}</td>
                  <td className="py-3 px-4 text-text-light dark:text-text-dark">{formatDate(task.completed_at || '')}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {task.status === 'completed' && (
                        <>
                          <Link 
                            to={`/tasks/${task.id}/data`}
                            className="bg-primary-light dark:bg-primary-dark hover:bg-opacity-90 text-white px-3 py-1 rounded-md text-xs transition-colors duration-300 flex items-center"
                          >
                            <svg className="h-3.5 w-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            View Data
                          </Link>
                          <Link 
                            to={`/tasks/${task.id}/analytics`}
                            className="bg-accent-light dark:bg-accent-dark hover:bg-opacity-90 text-white px-3 py-1 rounded-md text-xs transition-colors duration-300 flex items-center"
                          >
                            <svg className="h-3.5 w-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Analytics
                          </Link>
                        </>
                      )}
                      
                      {confirmDelete === task.id ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white px-3 py-1 rounded-md text-xs transition-colors duration-300 flex items-center"
                            disabled={isDeleting === task.id}
                          >
                            {isDeleting === task.id ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <svg className="h-3.5 w-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Confirm
                              </>
                            )}
                          </button>
                          <button
                            onClick={cancelDelete}
                            className="bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 text-white px-3 py-1 rounded-md text-xs transition-colors duration-300 flex items-center"
                            disabled={isDeleting === task.id}
                          >
                            <svg className="h-3.5 w-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => askDeleteConfirmation(task.id)}
                          className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs transition-colors duration-300 flex items-center"
                        >
                          <svg className="h-3.5 w-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskList; 