// background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log('YouTube Studio Enhancer extension installed');
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message in background script:', request);

  switch (request.type) {
    case 'GENERATE_CONTENT':
      handleApiRequest('/process', request.data, sendResponse);
      break;
    case 'ENHANCE_CONTENT':
      handleApiRequest('/enhance', request.data, sendResponse);
      break;
    case 'GENERATE_PROMPT':
      handleApiRequest('/prompt', request.data, sendResponse);
      break;
  }
  return true; // Will respond asynchronously
});

async function handleApiRequest(endpoint, data, sendResponse) {
  try {
    const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const responseData = await response.json();
      sendResponse({ success: true, data: responseData.result });
    } else {
      const errorText = await response.text();
      sendResponse({ success: false, error: errorText });
    }
  } catch (error) {
    console.error('API request error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

console.log('YouTube Studio Enhancer background script loaded.');