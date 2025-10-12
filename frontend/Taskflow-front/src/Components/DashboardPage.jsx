import React, { useState, useEffect } from 'react';
import Header from './Header';
import BoardCard from './BoardCard';
import { useNavigate } from 'react-router-dom';


import './Tail.css'

/**
 * DashboardPage: The main container component (The Digital Menu Board).
 * Manages the state for boards, loading status, and the overall application layout.
 */
function DashboardPage() {
  // State variables for dynamic content:
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 
  
  const navigate = useNavigate();

  // useEffect runs the data fetching routine once the component loads.
  useEffect(() => {
    // Dummy data for frontend development:
    const dummyBoards = [
        { id: 'b-001', title: 'Plan Backend API (PERN)', background_color: '#0079bf' },
        { id: 'b-002', title: 'Design System V1', background_color: '#519839' },
        { id: 'b-003', title: 'Marketing Content Ideas', background_color: '#b04632' },
        { id: 'b-004', title: 'Personal Learning Tracker', background_color: '#cd5a91' },
        { id: 'b-005', title: 'Bugs and QA Checklist', background_color: '#4bbf6b' },
        { id: 'b-006', title: 'User Feedback & Ideas', background_color: '#00838f' },
        { id: 'b-007', title: 'Trello Clone Roadmap', background_color: '#6e4c8f' },
    ];

    // Simulate network delay (1 second) to see the loading state
    const simulateFetch = setTimeout(() => {
      setBoards(dummyBoards);
      setIsLoading(false); // Finished loading
      setError(null);
    }, 1000); 

    // Cleanup function
    return () => clearTimeout(simulateFetch);

  }, [navigate]); 

  const handleLogout = () => {
    localStorage.removeItem('trello_clone_token');
    console.log("Simulating Logout: User token cleared and redirected.");
    navigate('/login'); 
  };

  return (
    // Tailwind classes applied: padding for fixed header, light background, full height
    <div className="pt-12 bg-gray-50 min-h-screen font-sans">
      <Header onLogout={handleLogout} userName="A. User" />

      {/* Boards Area: centered, maximum width, and padding */}
      <div className="p-5 md:px-10 max-w-7xl mx-auto">
        <h2 className="text-xl font-semibold mb-5 text-gray-700">Your Boards</h2>
        
        {/* Conditional Rendering */}
        {isLoading && <p className="text-gray-500 font-medium">Loading your boards...</p>}
        {error && <p className="text-red-600 font-bold">Error loading boards: {error}</p>}
        
        {/* Board Grid: Responsive grid structure */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {/* Render the board list only if loading is complete and no error occurred */}
          {!isLoading && !error && boards.map(board => (
            <BoardCard 
              key={board.id} 
              id={board.id} 
              title={board.title} 
              backgroundColor={board.background_color}
            />
          ))}
          
          {/* Create New Board Placeholder */}
          <div 
            className="bg-gray-200 rounded-lg h-24 flex items-center justify-center cursor-pointer text-gray-700 font-medium transition duration-200 shadow-md hover:bg-gray-300"
            onClick={() => console.log('Opens Create Board Modal')}
          >
            <p className="m-0 text-base">+ Create new board</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
