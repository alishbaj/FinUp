// Quick test to verify server setup
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Simple test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!', timestamp: Date.now() });
});

app.listen(PORT, () => {
    console.log(`Test server running on http://localhost:${PORT}`);
    console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
});

