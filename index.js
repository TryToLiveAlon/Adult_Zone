const express = require('express');
const app = express();
const port = 3000;

// Import and execute main.js
require('./main');

app.get('/', (req, res) => {
    res.send('<h1>Hi 👋</h1>');
});

// Start server
app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});
