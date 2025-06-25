const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
console.log('DASHSCOPE_API_KEY:', process.env.DASHSCOPE_API_KEY ? '[set]' : '[not set]');

const { getAIRecommendationWithImages } = require('./src/services/aiRecommendationService.cjs');

const app = express();
const PORT = process.env.PORT || 5174;

// Set Content Security Policy header
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "img-src 'self' data: https://dashscope-result-sh.oss-cn-shanghai.aliyuncs.com https://images.unsplash.com",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://findyoursuit.onrender.com https://dashscope-result-sh.oss-cn-shanghai.aliyuncs.com"
    ].join('; ')
  );
  next();
});

// Serve static files from the frontend build
app.use(express.static(path.join(__dirname, 'dist')));

app.use(cors());
app.use(bodyParser.json());

app.post('/api/recommend', async (req, res) => {
  try {
    console.log('[server.cjs] /api/recommend endpoint hit');
    console.log('[server.cjs] Received request body:', req.body);
    const preferences = req.body;
    console.log('[server.cjs] Calling getAIRecommendationWithImages...');
    const result = await getAIRecommendationWithImages(preferences);
    console.log('[server.cjs] Recommendation result:', result);
    res.json(result);
  } catch (err) {
    console.error('[server.cjs] Error in /api/recommend:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AI backend server running on http://localhost:${PORT}`);
}); 