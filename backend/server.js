const express = require('express');
const cors = require('cors');
const http = require('http'); // Required for Socket.IO
const { Server } = require('socket.io'); // Required for Socket.IO
const db = require('./DB'); 

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server manually for Socket.IO integration
const server = http.createServer(app); 

// --- Socket.IO Setup ---
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', 
        methods: ['GET', 'POST'],
    },
});

// Import JWT secret for verification
const jwt = require('jsonwebtoken');
const jwtSecret = 'super_secret_trello_key'; 

// 1. Socket.IO Authentication Middleware (Checks JWT before joining)
io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, jwtSecret);
            socket.userId = decoded.id; // Attach userId to the socket
            next();
        } catch (err) {
            console.error("Socket auth failed:", err.message);
            // Authentication failed
            next(new Error('Authentication failed: Invalid token'));
        }
    } else {
        // Token is missing
        next(new Error('Authentication failed: Token required'));
    }
});

// 2. Socket.IO Board Connection Logic
io.on('connection', (socket) => {
    socket.on('joinBoard', (boardId) => {
        socket.join(boardId);
        console.log(`User ${socket.userId} joined board room: ${boardId}`);
    });
    
    socket.on('disconnect', () => {
        // Clean up any room-specific data if needed
    });
});


// --- Express Middleware ---
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());


// --- Import Routes (MUST BE AFTER MIDDLEWARE) ---
const authRoutes = require('./routes/auth.js');
const boardRoutes = require('./routes/boards.js'); 

// --- Routes ---
// Pass the io instance to the boards router so it can emit events
app.use('/api/auth', authRoutes);
// boards.js exports an Express router. Do not call it as a function.
app.use('/api/boards', boardRoutes);

// Basic root route for server health check
app.get('/', (req, res) => {
    res.send('Trello Clone Backend is Running and Ready!');
});


// --- Server Startup ---
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Open http://localhost:${PORT}`);
});