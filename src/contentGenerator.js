import { generateContent, enhanceContent, generatePrompt } from './api/apiService';
import { updateButtonState, showSuccessMessage } from './utils/domUtils';
import { SELECTORS } from './constants/selectors';

async function handleGeneration(button, contentType, action = 'generate') {
  console.log(`Starting ${action} for ${contentType}`);

  try {
    updateButtonState(button, 'LOADING');
    
    let result;
    const inputSelector = contentType.toLowerCase() === 'title' 
      ? SELECTORS.TITLE_INPUT 
      : SELECTORS.DESCRIPTION_INPUT;
    
    const currentContent = document.querySelector(inputSelector)?.textContent || '';

    switch (action) {
      case 'generate':
        const videoLink = getVideoLink();
        if (!videoLink) {
          throw new Error('No video link found');
        }
        result = await generateContent(videoLink, getChoiceForContentType(contentType));
        break;
      
      case 'enhance':
        result = await enhanceContent(currentContent, contentType.toLowerCase());
        break;
      
      case 'prompt':
        result = await generatePrompt(currentContent, contentType.toLowerCase());
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    updateInputField(inputSelector, result, button, contentType);
    showSuccessMessage(button, `${contentType} ${action}d successfully!`);
    
    // Expand toolbar after successful generation
    const toolbar = button.closest('.toolbar');
    if (toolbar) {
      toolbar.classList.add('expanded');
    }
  } catch (error) {
    console.error(`Error ${action}ing ${contentType}:`, error);
    showSuccessMessage(button, error.message || `Error ${action}ing ${contentType}`, true);
    updateButtonState(button, 'INITIAL');
  }
}

function getChoiceForContentType(contentType) {
  switch (contentType.toLowerCase()) {
    case 'title': return 1;
    case 'description': return 2;
    case 'tags': return 3;
    default: return 1;
  }
}

function updateInputField(selector, value, button, contentType) {
  const inputElement = document.querySelector(selector);
  
  if (inputElement) {
    console.log(`Setting ${contentType} input value:`, value);
    
    inputElement.textContent = value;
    
    // Dispatch necessary events
    ['input', 'change'].forEach(eventType => {
      inputElement.dispatchEvent(new Event(eventType, { bubbles: true }));
    });
    
    const inputEvent = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: value
    });
    inputElement.dispatchEvent(inputEvent);
    
    inputElement.focus();
    inputElement.blur();
    
    updateButtonState(button, 'REGENERATE');
  } else {
    throw new Error(`Could not find ${contentType} input field`);
  }
}

function getVideoLink() {
  const linkElement = document.querySelector(SELECTORS.VIDEO_LINK);
  return linkElement ? linkElement.href : null;
}

export { handleGeneration };