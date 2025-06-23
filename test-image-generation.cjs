const { spawn } = require('child_process');
require('dotenv').config();

// Test function to call the Python script
async function testPythonImageGeneration(prompt) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', ['src/services/imageGeneration.py', prompt]);
    
    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
      console.log('Python output:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
      console.error('Python error:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python process error:', error);
        resolve(null);
      } else {
        const match = result.match(/Generated image URL: (.+)/);
        if (match && match[1]) {
          resolve(match[1].trim());
        } else {
          console.error('No image URL found in Python output');
          resolve(null);
        }
      }
    });
  });
}

// Test function to use the Node.js integration
async function testNodeIntegration() {
  const { getAIRecommendationWithImages } = require('./src/services/aiRecommendationService.cjs');
  
  const preferences = {
    occasion: "business meeting",
    suitColor: "charcoal gray",
    style: "professional",
    season: "winter"
  };

  console.log('Testing Node.js integration with preferences:', preferences);
  const result = await getAIRecommendationWithImages(preferences);
  console.log('Node.js integration result:', JSON.stringify(result, null, 2));
}

// Run tests
async function runTests() {
  console.log('Starting tests...');
  console.log('API Key present:', !!process.env.DASHSCOPE_API_KEY);

  console.log('\n1. Testing Python script directly...');
  const pythonResult = await testPythonImageGeneration(
    "Professional man wearing a charcoal gray business suit, white shirt, burgundy tie, full body photo, studio lighting"
  );
  console.log('Python test result:', pythonResult);

  console.log('\n2. Testing Node.js integration...');
  await testNodeIntegration();
}

runTests().catch(console.error); 