const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Serve static files from the current directory
app.use(express.static('.'));

// Default route to serve login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 MoneyVault Frontend Server running on http://localhost:${PORT}`);
  console.log(`🔗 Open http://localhost:${PORT} to access MoneyVault`);
});
