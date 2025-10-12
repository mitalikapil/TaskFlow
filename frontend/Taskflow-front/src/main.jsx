import React from 'react'; // If using StrictMode, though not required for this fix
import ReactDOM from 'react-dom/client'; // Import the client module
import App from './App.jsx';

// ⭐️ The Fix: Destructure and use the imported createRoot ⭐️
ReactDOM.createRoot(document.getElementById('root')).render(
    // You can optionally wrap <App /> in <React.StrictMode>
    <App />
);