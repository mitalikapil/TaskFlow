const jwt = require('jsonwebtoken');

// WARNING: Use a strong, environment-variable secret in production!
const jwtSecret = 'super_secret_trello_key'; 

const verifyToken = (req, res, next) => {
    // 1. Check for the token in the 'Authorization: Bearer <token>' header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // 401 Unauthorized: Token missing or improperly formatted
        return res.status(401).json({ message: 'Access denied. Authentication required.' });
    }

    // 2. Extract the token (removing 'Bearer ')
    const token = authHeader.split(' ')[1];

    try {
        // 3. Verify and decode the token
        const decoded = jwt.verify(token, jwtSecret);
        
        // 4. Attach the authenticated user's ID to the request object
        // This is crucial: req.userId is used in routes/boards.js
        req.userId = decoded.id; 
        
        next(); // Allow the request to proceed to the route handler
    } catch (ex) {
        // Token is invalid (e.g., expired, wrong secret)
        res.status(400).json({ message: 'Invalid token.' });
    }
};

module.exports = verifyToken;