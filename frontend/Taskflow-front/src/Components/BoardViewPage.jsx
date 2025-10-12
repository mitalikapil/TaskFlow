import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'; 
import io from 'socket.io-client'; 
import Header from './Header'; 
import CardDetailModal from './CardDetailModal'; 

const API_BASE_URL = 'http://localhost:5000/api/boards'; 

// Helper function to generate unique temporary IDs
const generateId = (prefix = 'id') => `${prefix}_temp_${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// --- Sub-component Definitions (Add Card Form) ---
const AddCardForm = ({ listId, handleAddCard, setIsAddingCard }) => {
    const [title, setTitle] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title.trim()) {
            handleAddCard(listId, title.trim());
            setTitle('');
            setIsAddingCard(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2 mt-2">
            <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for this card..."
                className="w-full p-2 text-sm rounded-md shadow-sm resize-none focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
                rows="3"
                autoFocus
            />
            <div className="flex items-center space-x-2">
                <button
                    type="submit"
                    className="bg-blue-600 text-white text-sm px-3 py-1 rounded-md font-medium hover:bg-blue-700 transition"
                >
                    Add Card
                </button>
                <button
                    type="button"
                    onClick={() => setIsAddingCard(false)}
                    className="text-2xl text-gray-500 hover:text-gray-700 leading-none"
                >
                    &times;
                </button>
            </div>
        </form>
    );
};

// --- Sub-component Definitions (List Container) ---
const ListContainer = ({ list, cards, index, handleAddCard, onCardClick }) => {
    const [isAddingCard, setIsAddingCard] = useState(false);

    return (
        <Draggable draggableId={list.id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="w-72 bg-gray-200 rounded-lg flex-shrink-0 p-2 shadow-md h-full"
                    style={{ ...provided.draggableProps.style, height: 'fit-content' }}
                >
                    <h3
                        {...provided.dragHandleProps}
                        className="font-semibold text-gray-800 text-sm mb-2 px-1 cursor-pointer hover:bg-gray-300 rounded-sm"
                    >
                        {list.title}
                    </h3>
                    
                    <Droppable droppableId={list.id} type="card">
                        {(provided) => (
                            <div 
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="card-list space-y-2 max-h-[75vh] overflow-y-auto"
                            >
                                {cards.map((card, cardIndex) => (
                                    <Card key={card.id} card={card} index={cardIndex} onCardClick={onCardClick} />
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>

                    {isAddingCard ? (
                        <div className="mt-2">
                            <AddCardForm 
                                listId={list.id} 
                                handleAddCard={handleAddCard} 
                                setIsAddingCard={setIsAddingCard} 
                            />
                        </div>
                    ) : (
                        <div 
                            onClick={() => setIsAddingCard(true)}
                            className="text-gray-600 text-sm p-1 cursor-pointer hover:bg-gray-300 rounded-md transition duration-150 mt-2 flex items-center space-x-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add a card</span>
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
};

// --- Sub-component Definitions (Card) ---
const Card = ({ card, index, onCardClick }) => {
    return (
        <Draggable draggableId={card.id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps} 
                    onClick={() => onCardClick(card)}
                    className="bg-white rounded-md p-2 shadow-sm cursor-pointer hover:bg-gray-100 transition duration-150 border-b border-gray-200"
                >
                    <p className="text-sm font-medium text-gray-800">{card.title}</p>
                </div>
            )}
        </Draggable>
    );
};

// --- Sub-component Definitions (Add List Form) ---
const AddListArea = ({ handleAddList }) => {
    const [isAddingList, setIsAddingList] = useState(false);
    const [title, setTitle] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title.trim()) {
            handleAddList(title.trim());
            setTitle('');
            setIsAddingList(false);
        }
    };

    if (isAddingList) {
        return (
            <div className="w-72 flex-shrink-0 p-2 rounded-lg bg-gray-200 shadow-md self-start">
                <form onSubmit={handleSubmit} className="space-y-2">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter list title..."
                        className="w-full p-2 text-sm rounded-md border border-blue-500 focus:ring-blue-500"
                        autoFocus
                    />
                    <div className="flex items-center space-x-2">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white text-sm px-3 py-1 rounded-md font-medium hover:bg-blue-700 transition"
                        >
                            Add List
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsAddingList(false)}
                            className="text-2xl text-gray-500 hover:text-gray-700 leading-none"
                        >
                            &times;
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div 
            onClick={() => setIsAddingList(true)}
            className="w-72 flex-shrink-0 p-2 rounded-lg bg-black/10 hover:bg-black/20 text-white cursor-pointer transition duration-150 self-start flex items-center space-x-1"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add another list</span>
        </div>
    );
}

// --- BoardViewPage Component ---
function BoardViewPage() {
    const { boardId } = useParams(); 
    const navigate = useNavigate();
    
    const [boardData, setBoardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); 
    const [selectedCard, setSelectedCard] = useState(null); 
    const [socket, setSocket] = useState(null); 

    const getToken = () => localStorage.getItem('trello_clone_token');

    // ----------------------------------------------------
    // SOCKET.IO CONNECTION AND REAL-TIME LISTENERS
    // ----------------------------------------------------
    useEffect(() => {
        const token = getToken();
        if (!token) return;

        const newSocket = io('http://localhost:5000', {
            query: { token: token }
        });

        newSocket.on('connect', () => {
            newSocket.emit('joinBoard', boardId);
        });

        newSocket.on('connect_error', (err) => {
            console.error("Socket connection failed:", err.message);
            if (err.message.includes('Authentication failed')) {
                localStorage.removeItem('trello_clone_token');
                navigate('/login');
            }
        });
        
        newSocket.on('card:moved', (cardUpdates) => {
            setBoardData(prevData => {
                if (!prevData) return prevData;
                
                const updatedCards = prevData.cards.map(card => {
                    const update = cardUpdates.find(u => u.id === card.id);
                    if (update) {
                        return { ...card, listId: update.listId, order_index: update.order };
                    }
                    return card;
                });

                return { ...prevData, cards: updatedCards };
            });
        });

        newSocket.on('list:reordered', (listUpdates) => {
            setBoardData(prevData => {
                if (!prevData) return prevData;
                
                const updatedLists = prevData.lists.map(list => {
                    const update = listUpdates.find(u => u.id === list.id);
                    if (update) {
                        return { ...list, order_index: update.order };
                    }
                    return list;
                });
                
                return { ...prevData, lists: updatedLists };
            });
        });

        newSocket.on('list:created', (newList) => {
             setBoardData(prevData => {
                if (!prevData) return prevData;
                return { ...prevData, lists: [...prevData.lists, newList] };
            });
        });


        setSocket(newSocket);
        
        return () => newSocket.disconnect();
    }, [boardId, navigate]);


    // ----------------------------------------------------
    // DATA FETCHING AND API INTEGRATION
    // ----------------------------------------------------
    
    // Initial fetch for board data (READ)
    useEffect(() => {
        const fetchBoardData = async () => {
            setIsLoading(true);
            setError(null);
            const token = getToken();

            if (!token) return navigate('/login');

            try {
                const response = await fetch(`${API_BASE_URL}/${boardId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.status === 403 || response.status === 404) {
                    throw new Error("Board not found or access denied.");
                }

                if (!response.ok) throw new Error("Failed to load board data.");

                const data = await response.json();
                setBoardData(data);
                
            } catch (err) {
                console.error("Failed to fetch board data:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBoardData();
    }, [boardId, navigate]);
    
    // Utility function to reorder arrays (used for lists)
    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };
    
    // ----------------------------------------------------
    // API PERSISTENCE FUNCTIONS (WRITE)
    // ----------------------------------------------------

    // Persist List Movement (Horizontal Drag)
    const persistListOrder = async (newLists) => {
        const token = getToken();
        const listUpdates = newLists.map(list => ({ id: list.id, order: list.order_index }));
        
        try {
            const response = await fetch(`${API_BASE_URL}/lists/reorder`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ listUpdates, boardId }) 
            });

            if (!response.ok) throw new Error('Failed to save list order.');

        } catch (error) {
            console.error('List persistence error:', error);
        }
    }

    // Persist Card Movement (Intra/Inter-List Drag)
    const persistCardMovement = async (cardUpdates) => {
        const token = getToken();
        
        try {
            const response = await fetch(`${API_BASE_URL}/cards/reorder`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ cardUpdates, boardId }) 
            });

            if (!response.ok) throw new Error('Failed to save card movement.');

        } catch (error) {
            console.error('Card persistence error:', error);
        }
    }
    
    // Add New Card
    const handleAddCard = async (listId, cardTitle) => {
        if (!boardData) return;
        const token = getToken();
        
        // 1. Prepare optimistic data
        const newTempId = generateId('c');
        const cardsInList = boardData.cards.filter(c => c.listId === listId);
        const newOrder = cardsInList.length + 1;

        const newCard = {
            id: newTempId,
            listId: listId,
            title: cardTitle,
            order_index: newOrder,
            description: '',
        };

        // 2. Optimistic UI Update
        setBoardData(prevData => ({
            ...prevData,
            cards: [...prevData.cards, newCard]
        }));

        try {
            const response = await fetch(`${API_BASE_URL}/cards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ listId, title: cardTitle, order_index: newOrder })
            });

            if (!response.ok) throw new Error('Failed to save new card.');

            const savedCard = await response.json(); 
            
            // 3. Final State Sync
            setBoardData(prevData => ({
                ...prevData,
                cards: prevData.cards.map(c => c.id === newTempId ? savedCard : c)
            }));

        } catch (error) {
            console.error("Error saving card:", error);
            // Rollback: Remove the card if the API fails
            setBoardData(prevData => ({
                ...prevData,
                cards: prevData.cards.filter(c => c.id !== newTempId)
            }));
        }
    };

    // ⭐️ NEW: Add New List ⭐️
    const handleAddList = async (listTitle) => {
        if (!boardData) return;
        const token = getToken();
        
        // 1. Prepare optimistic data
        const newTempId = generateId('l');
        const newOrder = boardData.lists.length + 1;

        const newList = {
            id: newTempId,
            boardId: boardId,
            title: listTitle,
            order_index: newOrder,
        };

        // 2. Optimistic UI Update
        setBoardData(prevData => ({
            ...prevData,
            lists: [...prevData.lists, newList]
        }));

        try {
            const response = await fetch(`${API_BASE_URL}/lists`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ boardId, title: listTitle, order_index: newOrder })
            });

            if (!response.ok) throw new Error('Failed to save new list.');

            const savedList = await response.json(); 
            
            // 3. Final State Sync
            setBoardData(prevData => ({
                ...prevData,
                lists: prevData.lists.map(l => l.id === newTempId ? savedList : l)
            }));

            // 4. Socket Broadcast (Manual stabilization for creation)
            if (socket) {
                 socket.emit('list:created', savedList);
            }

        } catch (error) {
            console.error("Error saving list:", error);
            // Rollback
            setBoardData(prevData => ({
                ...prevData,
                lists: prevData.lists.filter(l => l.id !== newTempId)
            }));
        }
    };


    // ----------------------------------------------------
    // DND LOGIC
    // ----------------------------------------------------
    const onDragEnd = (result) => {
        const { source, destination, draggableId, type } = result;
        if (!destination || !boardData) return;

        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        let newBoardData = JSON.parse(JSON.stringify(boardData));

        if (type === 'list') {
            const newLists = reorder(
                newBoardData.lists,
                source.index,
                destination.index
            );
            
            newLists.forEach((list, index) => {
                list.order_index = index + 1;
            });
            
            setBoardData({ ...newBoardData, lists: newLists });
            persistListOrder(newLists); 
            return;
        }

        // --- Card Movement Logic (Intra/Inter-list) ---
        const startListId = source.droppableId;
        const endListId = destination.droppableId;
        
        let startCards = newBoardData.cards.filter(c => c.listId === startListId).sort((a, b) => a.order_index - b.order_index);
        let endCards = (startListId === endListId) 
            ? startCards 
            : newBoardData.cards.filter(c => c.listId === endListId).sort((a, b) => a.order_index - b.order_index);
        
        const cardToMoveIndex = startCards.findIndex(c => c.id === draggableId);
        const [movedCard] = startCards.splice(cardToMoveIndex, 1);
        
        if (startListId !== endListId) {
            movedCard.listId = endListId;
        }
        
        endCards.splice(destination.index, 0, movedCard);

        const cardUpdates = []; 
        const finalCards = [];

        newBoardData.lists.forEach(list => {
            let listCards;
            
            if (list.id === startListId && startListId !== endListId) {
                listCards = startCards;
            } else if (list.id === endListId) {
                listCards = endCards;
            } else {
                listCards = newBoardData.cards.filter(c => c.listId === list.id).sort((a, b) => a.order_index - b.order_index);
            }
            
            listCards.forEach((card, index) => {
                const newOrder = index + 1;
                
                if (card.order_index !== newOrder || card.listId !== list.id || card.id === draggableId) {
                    cardUpdates.push({ id: card.id, listId: card.listId, order: newOrder });
                }
                
                card.order_index = newOrder; 
                finalCards.push(card);
            });
        });

        setBoardData({ ...newBoardData, cards: finalCards });
        persistCardMovement(cardUpdates);
    };


    // --- UI HANDLERS ---
    const handleCardClick = (card) => {
        setSelectedCard(card);
    };
    
    // --- RENDERING ---
    if (isLoading || !boardData) {
        return (
            <div className="pt-12 bg-gray-50 min-h-screen p-5">
                <Header onLogout={() => navigate('/login')} userName="A. User" onCreateBoard={() => {}} />
                <div className="text-center mt-20 text-gray-600">
                    {error ? <p className="text-red-500">{error}</p> : "Loading board data..."}
                </div>
            </div>
        );
    }

    const sortedLists = boardData.lists.sort((a, b) => a.order_index - b.order_index);

    return (
        <div className="pt-12 min-h-screen font-sans bg-blue-600">
            <Header onLogout={() => navigate('/login')} userName="A. User" onCreateBoard={() => {}} />

            <div className="p-2 px-4 bg-black bg-opacity-20 text-white shadow-md">
                <h1 className="text-xl font-bold">{boardData.board.title}</h1>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="board" type="list" direction="horizontal">
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="p-4 flex space-x-4 h-full overflow-x-auto items-start"
                        >
                            {/* Map Lists */}
                            {sortedLists.map((list, index) => (
                                <ListContainer 
                                    key={list.id} 
                                    list={list} 
                                    index={index} 
                                    cards={boardData.cards
                                        .filter(card => card.listId === list.id)
                                        .sort((a, b) => a.order_index - b.order_index)}
                                    onCardClick={handleCardClick}
                                    handleAddCard={handleAddCard}
                                />
                            ))}

                            {provided.placeholder}
                            
                            {/* Add List Form Area */}
                            <AddListArea handleAddList={handleAddList} />
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {selectedCard && (
                <CardDetailModal
                    card={selectedCard} 
                    onClose={() => setSelectedCard(null)}
                    listTitle={sortedLists.find(l => l.id === selectedCard.listId)?.title || "Unknown List"}
                />
            )}
        </div>
    );
}

export default BoardViewPage;