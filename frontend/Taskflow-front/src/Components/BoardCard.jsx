import React from 'react';
import { Link } from 'react-router-dom';


import './Tail.css'

/**
 * BoardCard: A reusable component to display a summary link for a single board.
 * It uses props for dynamic content and styling.
 */
function BoardCard({ id, title, backgroundColor }) {
  // Use inline style to apply the dynamic background color fetched from the data
  const cardStyle = {
    backgroundColor: backgroundColor,
  };

  return (
    // Link navigates to the specific board view (e.g., /board/b-001)
    <Link 
      to={`/board/${id}`} 
      className="block rounded-lg h-24 p-4 text-white font-bold shadow-md cursor-pointer 
                 transition duration-150 ease-in-out hover:opacity-90 hover:shadow-xl"
      style={cardStyle}
    >
      <h3 className="text-lg line-clamp-2 leading-tight break-words">
        {title}
      </h3>
      {/* Optional: You could add icons or status indicators here */}
    </Link>
  );
}

export default BoardCard;
