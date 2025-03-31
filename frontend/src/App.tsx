import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import DataViewer from './components/DataViewer';
import AnalyticsViewer from './components/AnalyticsViewer';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const [refreshFlag, setRefreshFlag] = React.useState(0);
  
  const handleTaskCreated = () => {
    // Force refresh of task list when a new task is created
    setRefreshFlag(prev => prev + 1);
  };
  
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
          <header className="bg-card-light dark:bg-card-dark shadow transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-light dark:text-text-dark transition-colors duration-300">
                  Real Estate Data Hub
                </h1>
                <div className="flex items-center space-x-4">
                  <nav>
                    <Link to="/" className="px-4 py-2 font-medium text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-300">
                      Home
                    </Link>
                  </nav>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </header>
          
          <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 animate-fade-in">
            <Routes>
              <Route path="/" element={
                <>
                  <div className="mb-6 animate-scale-in">
                    <TaskForm onTaskCreated={handleTaskCreated} />
                  </div>
                  <div className="animate-slide-in-left">
                    <TaskList key={refreshFlag} />
                  </div>
                </>
              } />
              <Route path="/tasks/:taskId/data" element={
                <div className="animate-slide-in-right">
                  <DataViewer />
                </div>
              } />
              <Route path="/tasks/:taskId/analytics" element={
                <div className="animate-slide-in-right">
                  <AnalyticsViewer />
                </div>
              } />
            </Routes>
          </main>
          
          <footer className="bg-card-light dark:bg-card-dark shadow mt-8 py-4 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-center text-gray-600 dark:text-gray-400 transition-colors duration-300">
                Real Estate Data Hub &copy; {new Date().getFullYear()}
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
