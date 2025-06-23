const axios = require('axios');
require('dotenv').config();

async function testFluxImage() {
  try {
    // Submit the image generation job
    const submitResponse = await axios({
      method: 'post',
      url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
      headers: {
        'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable'
      },
      data: {
        model: 'flux-schnell',
        input: {
          prompt: "Professional man in a business suit, full body photo, studio lighting"
        },
        parameters: {
          size: '576*1024',
          steps: 4,
          guidance: 7.5
        }
      }
    });

    console.log('Job submission response:', JSON.stringify(submitResponse.data, null, 2));

    // Check if we got a task ID
    if (submitResponse.data && submitResponse.data.output && submitResponse.data.output.task_id) {
      const taskId = submitResponse.data.output.task_id;
      console.log('Task ID:', taskId);

      // Poll for results
      while (true) {
        const statusResponse = await axios({
          method: 'get',
          url: `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
          headers: {
            'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`
          }
        });

        const taskStatus = statusResponse.data.output.task_status;
        console.log('Task status:', taskStatus);

        if (taskStatus === 'SUCCEEDED') {
          console.log('Success! Results:', JSON.stringify(statusResponse.data.output.results, null, 2));
          break;
        } else if (taskStatus === 'FAILED') {
          console.error('Task failed:', statusResponse.data);
          break;
        } else if (['PENDING', 'RUNNING'].includes(taskStatus)) {
          // Wait 2 seconds before next poll
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.error('Unexpected task status:', taskStatus);
          break;
        }
      }
    } else {
      console.error('No task ID in response:', submitResponse.data);
    }
  } catch (error) {
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else {
      console.error('Error:', error.message);
    }
  }
}

testFluxImage(); 