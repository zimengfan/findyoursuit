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
      "img-src 'self' data: https://dashscope-result-sh.oss-cn-shanghai.aliyuncs.com",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' http://localhost:5174 https://dashscope-result-sh.oss-cn-shanghai.aliyuncs.com"
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
    console.log('Received request:', req.body);
    const preferences = req.body;
    const result = await getAIRecommendationWithImages(preferences);
    console.log('Result:', result);
    res.json(result);
  } catch (err) {
    console.error('Error in /api/recommend:', err);
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