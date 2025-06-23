const axios = require('axios');
require('dotenv').config();

async function testQwen() {
  try {
    const response = await axios.post('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      model: 'qwen-turbo',
      input: { prompt: 'Say hello in JSON: {"hello": "world"}' },
      parameters: { result_format: 'text' }
    }, {
      headers: { 'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}` }
    });
    console.log('DashScope response:', response.data);
  } catch (err) {
    console.error('DashScope error:', err.response ? err.response.data : err.message);
  }
}

testQwen();