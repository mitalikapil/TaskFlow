import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:5000/api/boards/cards';

function CardDetailModal({ card, onClose, listTitle }) {
    if (!card) return null;

    // Local state for fields that can be edited
    const [title, setTitle] = useState(card.title || 'Untitled Card');
    const [description, setDescription] = useState(card.description || '');

    const getToken = () => localStorage.getItem('trello_clone_token');

    // Handler to save the specific field that was just edited
    const handleFieldUpdate = async (fieldName, value) => {
        const token = getToken();
        if (!token) return console.error("Authentication required for save.");

        // Data object dynamically constructed based on the field that triggered the update
        const updateData = { [fieldName]: value };

        try {
            const response = await fetch(`${API_BASE_URL}/${card.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                // In a real app, you would show an error notification here
                console.error(`Failed to update ${fieldName}`);
            } else {
                console.log(`${fieldName} updated successfully!`);
                // OPTIONAL: Update the global state here if needed, or rely on a GET refetch
            }
        } catch (err) {
            console.error("Network error during save:", err);
        }
    };

    return (
        // Modal Overlay (fixed screen, dim background)
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-10 z-50 overflow-y-auto"
            onClick={onClose} 
        >
            {/* Modal Content */}
            <div 
                className="bg-white rounded-lg shadow-2xl w-full max-w-2xl transform transition-all duration-300 relative"
                onClick={(e) => e.stopPropagation()} 
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Card Title (Editable on blur) */}
                <div className="p-6 pb-2">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={(e) => handleFieldUpdate('title', e.target.value)} 
                        className="text-xl font-bold w-full p-1 -m-1 focus:bg-gray-100 rounded focus:outline-none"
                    />
                    <p className="text-sm text-gray-500 mt-1">in list: **{listTitle}**</p>
                </div>

                <div className="p-6 pt-4 flex space-x-6">
                    {/* Left Column: Details */}
                    <div className="flex-grow">
                        
                        {/* Description Section */}
                        <div className="flex items-center space-x-2 mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                            <h4 className="text-sm font-semibold text-gray-800">Description</h4>
                        </div>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={(e) => handleFieldUpdate('description', e.target.value)} 
                            placeholder="Add a more detailed description..."
                            className="w-full min-h-[100px] p-2 text-sm rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                        />
                        
                        {/* Placeholder for Comments */}
                        <div className="mt-6 space-y-4">
                            <h4 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span>Activity (Comments)</span>
                            </h4>
                        </div>
                    </div>

                    {/* Right Column: Actions (Sidebar) */}
                    <div className="w-48 flex-shrink-0">
                        <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Actions</h4>
                        <button className="w-full flex items-center space-x-2 p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-800 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <span>Members</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CardDetailModal;