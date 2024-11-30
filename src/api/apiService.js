// API endpoints and service functions
const API_BASE_URL = 'http://127.0.0.1:5000';

export async function generateContent(url, choice) {
  return makeApiRequest('/process', { url, choice });
}

export async function enhanceContent(content, type) {
  return makeApiRequest('/enhance', { content, type });
}

export async function generatePrompt(content, type) {
  return makeApiRequest('/prompt', { content, type });
}

async function makeApiRequest(endpoint, data) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const responseData = await response.json();
    return responseData.result;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}