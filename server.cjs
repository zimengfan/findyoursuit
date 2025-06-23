const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
console.log('DASHSCOPE_API_KEY:', process.env.DASHSCOPE_API_KEY ? '[set]' : '[not set]');

const { getAIRecommendationWithImages } = require('./src/services/aiRecommendationService.cjs');

const app = express();
const PORT = process.env.PORT || 5174;

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

app.listen(PORT, () => {
  console.log(`AI backend server running on http://localhost:${PORT}`);
}); 