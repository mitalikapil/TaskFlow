// --- Example App.jsx update (Do this in your local file) ---

import { BrowserRouter, Routes, Route,Navigate } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute'; // <-- Import the new file
import DashboardPage from './Components/DashboardPage';
import BoardViewPage from './Components/BoardViewPage';
import Login from './Components/Login'; 
import Signup from './Components/Signup'; // Assuming Signup is renamed/imported here

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (No token needed) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes (Requires a valid token) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/board/:boardId" 
          element={
            <ProtectedRoute>
              <BoardViewPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;


