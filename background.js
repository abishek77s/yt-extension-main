// background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log('YouTube Studio Enhancer extension installed');
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message in background script:', request);

  if (request.type === 'GENERATE_CONTENT') {
    console.log('Processing content generation request:', request.data);
    handleContentGeneration(request.data)
      .then(response => {
        console.log('Content generation response:', response);
        sendResponse({ success: true, data: response });
      })
      .catch(error => {
        console.error('Content generation error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Will respond asynchronously
  }

  if (request.type === 'PROCESS_VIDEO_LINK') {
    console.log('Processing video link request:', request.data);
    handleVideoLinkProcessing(request.data)
      .then(response => {
        console.log('Video link processing response:', response);
        sendResponse({ success: true, data: response });
      })
      .catch(error => {
        console.error('Video link processing error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Will respond asynchronously
  }
});

async function handleContentGeneration({ contentType, prompt, choice }) {
  console.log('Handling content generation:', { contentType, prompt, choice });

  try {
    const response = await fetch('http://127.0.0.1:5000/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: prompt, choice })
    });

    console.log('Fetch response:', response);

    if (response.ok) {
      const data = await response.json();
      console.log('Processed content data:', data);
      return data.result;
    } else {
      const errorText = await response.text();
      console.error(`Error generating ${contentType}:`, errorText);
      throw new Error(`Error generating ${contentType}: ${errorText}`);
    }
  } catch (error) {
    console.error(`Catch block - Error generating ${contentType}:`, error);
    throw error;
  }
}

async function handleVideoLinkProcessing({ url, choice }) {
  console.log('Handling video link processing:', { url, choice });

  try {
    const response = await fetch('http://localhost:5000/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, choice })
    });

    console.log('Fetch response:', response);

    if (response.ok) {
      const data = await response.json();
      console.log('Processed video link data:', data);
      return data.result;
    } else {
      const errorText = await response.text();
      console.error('Error processing video link:', errorText);
      throw new Error(`Error processing video link: ${errorText}`);
    }
  } catch (error) {
    console.error('Catch block - Error processing video link:', error);
    throw error;
  }
}

console.log('YouTube Studio Enhancer background script loaded.');

