import express from 'express';
import path from 'path';

const app = express();
const __dirname = path.resolve();

// Serve frontend build
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Fallback for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

app.listen(3000, () => console.log('Server running on port 3000'));
