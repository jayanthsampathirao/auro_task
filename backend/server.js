const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
    user: 'portfolio_user',
    host: 'localhost',
    database: 'portfolio_db',
    password: 'your_password',  // Replace with your actual password
    port: 5432
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to database');
    }
});

// AUTH ROUTES
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log('Registration attempt:', { username, email });

        // Validate inputs
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username',
            [username, email, hashedPassword]
        );

        // Generate JWT token
        const token = jwt.sign({ id: result.rows[0].id }, 'your_secret_key');

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === '23505') { // Unique violation
            res.status(400).json({ error: 'Username or email already exists' });
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const valid = await bcrypt.compare(password, result.rows[0].password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: result.rows[0].id }, 'your_secret_key');
        res.json({ token, user: { id: result.rows[0].id, username: result.rows[0].username } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, 'your_secret_key', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// PORTFOLIO ROUTES
app.post('/api/portfolios', authenticateToken, async (req, res) => {
    try {
        const { title, description } = req.body;
        const result = await pool.query(
            'INSERT INTO portfolios (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
            [req.user.id, title, description]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/portfolios', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM portfolios WHERE user_id = $1',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/public-portfolios', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT p.*, u.username FROM portfolios p JOIN users u ON p.user_id = u.id WHERE p.is_public = true'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});