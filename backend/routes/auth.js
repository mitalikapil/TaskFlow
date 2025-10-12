const router = require('express').Router();
// Use relative path to import the project's DB pool
const db = require('../DB'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// WARNING: In a real app, load JWT_SECRET from process.env 
const jwtSecret = 'super_secret_trello_key'; 

// Helper: Generate JWT
const generateToken = (id) => {
    // Token expires in 1 day
    return jwt.sign({ id }, jwtSecret, { expiresIn: '1d' }); 
};

// ----------------------------------------------------
// 1. POST /api/auth/signup (User Registration)
// ----------------------------------------------------
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check if user already exists
        const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(409).json({ message: 'Email already in use.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await db.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
            [name, email, hashedPassword]
        );
        const userId = result.rows[0].id;

        // Generate token
        const token = generateToken(userId);
        res.status(201).json({ token, userId, name });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// ----------------------------------------------------
// 2. POST /api/auth/login (User Login)
// ----------------------------------------------------
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Find user by email
        const userResult = await db.query('SELECT id, name, password FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Compare the provided password with the hashed password in the DB
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Passwords match! Generate token and respond
        const token = generateToken(user.id);
        res.status(200).json({ token, userId: user.id, name: user.name });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

module.exports = router;