import React, { useState } from 'react';
import { Link } from 'react-router-dom';


import './Tail.css'

function Header({ onLogout, userName = 'User', onCreateBoard }) {
  // State to control the visibility of the user dropdown menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Gets the first letter of the user's name for the avatar
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="fixed top-0 left-0 w-full flex items-center justify-between px-4 py-2 bg-black bg-opacity-30 text-white shadow-lg z-50">
      
      {/* Left Section: Logo and Navigation */}
      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className="text-xl font-bold tracking-wider hover:text-gray-200 transition">
          Trello Clone
        </Link>
        
        {/* Create Button (calls the prop passed from the parent) */}
        <button 
          onClick={onCreateBoard}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-md text-sm font-medium transition duration-150"
        >
          + Create
        </button>

        {/* Search Input Placeholder */}
        <input 
          type="text" 
          placeholder="Search"
          className="bg-white bg-opacity-20 text-white placeholder-gray-200 text-sm px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-32 md:w-48 transition"
        />
      </div>

      {/* Right Section: User Controls */}
      <div className="relative flex items-center space-x-2">
        {/* Notifications Icon Placeholder */}
        <button className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition">
            {/* SVG for Bell Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L14 11.586V8a6 6 0 00-6-6zm-4.707 10.293L4 11.586V8a6 6 0 0112 0v3.586l-1.293 1.293A1 1 0 0115 13H5a1 1 0 01-.707-.293zM10 18a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
        </button>

        {/* User Avatar with Dropdown Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold shadow-md hover:ring-2 ring-white transition"
        >
          {userInitial}
        </button>

        {/* Dropdown Menu (Conditional Rendering) */}
        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl overflow-hidden z-50">
            <div className="p-3 border-b border-gray-200">
                <p className="font-semibold">{userName}</p>
                <p className="text-xs text-gray-500">View Profile</p>
            </div>
            {/* Logout Button (calls the prop passed from the parent) */}
            <button 
              onClick={onLogout} 
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
