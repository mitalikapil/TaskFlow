const express = require('express');
const router = express.Router(); // ⭐️ CRITICAL: Defines the router variable
const db = require('../DB'); 
const verifyToken = require('../middleware/auth'); 

// ----------------------------------------------------
// 1. POST /api/boards: Create a new board
// ----------------------------------------------------
router.post('/', verifyToken, async (req, res) => {
    const { title, backgroundColor } = req.body;
    const userId = req.userId;

    if (!title) {
        return res.status(400).json({ message: 'Board title is required.' });
    }

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert the new board
        const boardResult = await client.query(
            `INSERT INTO boards (title, background_color) 
             VALUES ($1, $2) RETURNING id, title, background_color`,
            [title, backgroundColor || '#0079bf']
        );
        const newBoard = boardResult.rows[0];

        // 2. Assign the creator as the initial member and owner
        await client.query(
            `INSERT INTO users_boards (user_id, board_id, is_owner) 
             VALUES ($1, $2, TRUE)`,
            [userId, newBoard.id]
        );
        
        // 3. Create the three default lists
        const defaultLists = [
            { title: 'To Do', order: 1 },
            { title: 'In Progress', order: 2 },
            { title: 'Done', order: 3 },
        ];

        for (const list of defaultLists) {
            await client.query(
                `INSERT INTO lists (board_id, title, order_index)
                 VALUES ($1, $2, $3)`,
                [newBoard.id, list.title, list.order]
            );
        }

        await client.query('COMMIT'); 

        res.status(201).json(newBoard);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating board and default lists:', error);
        res.status(500).json({ message: 'Failed to create board.' });
    } finally {
        client.release();
    }
});


// ----------------------------------------------------
// 2. GET /api/boards: Fetch all boards for the authenticated user
// ----------------------------------------------------
router.get('/', verifyToken, async (req, res) => {
    const userId = req.userId;

    try {
        const result = await db.query(
            `SELECT 
                b.id, 
                b.title, 
                b.background_color
             FROM boards b
             JOIN users_boards ub ON b.id = ub.board_id
             WHERE ub.user_id = $1
             ORDER BY b.created_at DESC`,
            [userId]
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error fetching boards:', error);
        res.status(500).json({ message: 'Failed to fetch boards.' });
    }
});


// ----------------------------------------------------
// 3. GET /api/boards/:boardId: Fetch a single board with all lists and cards
// ----------------------------------------------------
router.get('/:boardId', verifyToken, async (req, res) => {
    const { boardId } = req.params;
    const userId = req.userId;

    try {
        // SECURITY CHECK: Ensure the user is a member of this board
        const memberCheck = await db.query(
            `SELECT 1 FROM users_boards WHERE user_id = $1 AND board_id = $2`,
            [userId, boardId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied to this board.' });
        }

        // Fetch the board details
        const boardResult = await db.query('SELECT id, title, background_color FROM boards WHERE id = $1', [boardId]);
        
        if (boardResult.rows.length === 0) {
            return res.status(404).json({ message: 'Board not found.' });
        }
        
        const board = boardResult.rows[0];

        // Fetch all lists for the board, sorted by order_index
        const listsResult = await db.query(
            `SELECT id, title, order_index FROM lists WHERE board_id = $1 ORDER BY order_index ASC`,
            [boardId]
        );

        // Fetch all cards for the board, sorted by order_index
        const cardsResult = await db.query(
            `SELECT id, list_id, title, description, due_date, order_index 
             FROM cards 
             WHERE list_id IN (SELECT id FROM lists WHERE board_id = $1)
             ORDER BY order_index ASC`,
            [boardId]
        );

        // Return the full hierarchical data structure
        res.status(200).json({
            board,
            lists: listsResult.rows,
            cards: cardsResult.rows
        });

    } catch (error) {
        console.error('Error fetching single board data:', error);
        res.status(500).json({ message: 'Failed to fetch board details.' });
    }
});


// ----------------------------------------------------
// 4. PUT /api/boards/lists/reorder: Persist List Movement
// ----------------------------------------------------
router.put('/lists/reorder', verifyToken, async (req, res) => {
    const { listUpdates } = req.body; 

    if (!Array.isArray(listUpdates) || listUpdates.length === 0) {
        return res.status(400).json({ message: 'List updates array is required.' });
    }

    try {
        const client = await db.connect();
        await client.query('BEGIN');

        for (const update of listUpdates) {
            await client.query(
                `UPDATE lists SET order_index = $1 WHERE id = $2`,
                [update.order, update.id]
            );
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'List order updated successfully.' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error reordering lists:', error);
        res.status(500).json({ message: 'Failed to persist list order.' });
    } finally {
        client.release();
    }
});


// ----------------------------------------------------
// 5. PUT /api/boards/cards/reorder: Persist Card Movement
// ----------------------------------------------------
router.put('/cards/reorder', verifyToken, async (req, res) => {
    const { cardUpdates } = req.body; 

    if (!Array.isArray(cardUpdates) || cardUpdates.length === 0) {
        return res.status(400).json({ message: 'Card updates array is required.' });
    }

    try {
        const client = await db.connect();
        await client.query('BEGIN');

        for (const update of cardUpdates) {
            await client.query(
                `UPDATE cards 
                 SET list_id = $1, order_index = $2 
                 WHERE id = $3`,
                [update.listId, update.order, update.id]
            );
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Card movement persisted successfully.' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error persisting card movement:', error);
        res.status(500).json({ message: 'Failed to persist card movement.' });
    } finally {
        client.release();
    }
});


// ----------------------------------------------------
// 6. POST /api/boards/cards: Create a new card
// ----------------------------------------------------
router.post('/cards', verifyToken, async (req, res) => {
    const { listId, title, order_index } = req.body;
    
    if (!listId || !title || order_index === undefined) {
        return res.status(400).json({ message: 'Missing required card fields.' });
    }

    try {
        const result = await db.query(
            `INSERT INTO cards (list_id, title, order_index, description, due_date)
             VALUES ($1, $2, $3, '', NULL) 
             RETURNING id, list_id, title, order_index, description, due_date`,
            [listId, title, order_index]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Error creating new card:', error);
        res.status(500).json({ message: 'Failed to create new card.' });
    }
});


// ----------------------------------------------------
// 7. POST /api/boards/lists: Create a new list (column)
// ----------------------------------------------------
router.post('/lists', verifyToken, async (req, res) => {
    const { boardId, title, order_index } = req.body;
    
    if (!boardId || !title || order_index === undefined) {
        return res.status(400).json({ message: 'Missing required list fields.' });
    }

    try {
        const result = await db.query(
            `INSERT INTO lists (board_id, title, order_index)
             VALUES ($1, $2, $3) 
             RETURNING id, board_id, title, order_index`,
            [boardId, title, order_index]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Error creating new list:', error);
        res.status(500).json({ message: 'Failed to create new list.' });
    }
});


// ----------------------------------------------------
// 8. PUT /api/boards/cards/:cardId: Update card title/description/etc.
// ----------------------------------------------------
router.put('/cards/:cardId', verifyToken, async (req, res) => {
    const { cardId } = req.params;
    const { title, description, dueDate } = req.body; 
    
    let query = 'UPDATE cards SET ';
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
        updates.push(`title = $${paramIndex++}`);
        values.push(title);
    }
    if (description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(description);
    }
    if (dueDate !== undefined) {
        updates.push(`due_date = $${paramIndex++}`);
        values.push(dueDate);
    }
    
    if (updates.length === 0) {
        return res.status(400).json({ message: 'No fields provided for update.' });
    }

    query += updates.join(', ') + ` WHERE id = $${paramIndex} RETURNING *`;
    values.push(cardId);

    try {
        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Card not found.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating card details:', error);
        res.status(500).json({ message: 'Failed to update card details.' });
    }
});


module.exports = router;