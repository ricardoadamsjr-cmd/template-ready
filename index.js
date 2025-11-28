// index.js (example of a simple server)
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'templatevault/public' directory
app.use(express.static(path.join(__dirname, 'templatevault/public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templatevault/public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
