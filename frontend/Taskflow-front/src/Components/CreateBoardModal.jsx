import React, { useState } from 'react';

import './Tail.css'
// Define background color options similar to Trello
const COLOR_OPTIONS = [
    '#0079bf', '#d29034', '#519839', '#b04632', '#89609e', 
    '#cd5a91', '#4bbf6b', '#00838f', '#355263', '#6e4c8f'
];

/**
 * CreateBoardModal: The form interface for creating a new board.
 * Receives onClose and onCreate callback functions via props.
 */
function CreateBoardModal({ onClose, onCreate }) {
    // State to hold user input for the new board
    const [title, setTitle] = useState('');
    const [background, setBackground] = useState(COLOR_OPTIONS[0]); // Default to first color
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!title.trim()) {
            // Basic validation
            alert("Please enter a board title.");
            return;
        }

        setIsSubmitting(true);
        
        // Simulating the API call to your backend (which would happen here)
        setTimeout(() => {
            // Call the parent handler (DashboardPage) with the new board data
            onCreate({ title, background });
            setIsSubmitting(false);
        }, 300); // Small delay to simulate network request
    };

    return (
        // Modal Overlay (The dimmed glass over the menu)
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            
            {/* Modal Content (The form window) - Stop click propagation */}
            <div 
                className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition duration-300 scale-100"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold text-gray-800 mb-4">Create Board</h3>

                <form onSubmit={handleSubmit}>
                    {/* 1. Title Input */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Board Title <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Project Alpha"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-4"
                        disabled={isSubmitting}
                        maxLength={50}
                    />

                    {/* 2. Background Selector */}
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Color
                    </label>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {COLOR_OPTIONS.map(color => (
                            <div
                                key={color}
                                className={`w-8 h-8 rounded-md cursor-pointer transition duration-150 shadow-md ${background === color ? 'ring-4 ring-offset-2 ring-blue-500' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setBackground(color)}
                                title={color}
                            ></div>
                        ))}
                    </div>

                    {/* 3. Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${isSubmitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateBoardModal;
