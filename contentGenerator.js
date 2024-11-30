// Content generation handling
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
    
    if (contentType.toLowerCase() === 'tags') {
      // Handle tags differently - they need to be added one by one
      const tags = value.split(',').map(tag => tag.trim());
      tags.forEach(tag => {
        inputElement.value = tag;
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });
      inputElement.value = ''; // Clear the input after adding all tags
    } else {
      // Handle title and description
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
    }
    
    updateButtonState(button, 'REGENERATE');
  } else {
    throw new Error(`Could not find ${contentType} input field`);
  }
}

async function handleGeneration(button, contentType, action = 'generate') {
  console.log(`Starting ${action} for ${contentType}`);

  try {
    updateButtonState(button, 'LOADING');
    
    const inputSelector = contentType.toLowerCase() === 'tags' 
      ? SELECTORS.TAGS_INPUT 
      : contentType.toLowerCase() === 'title' 
        ? SELECTORS.TITLE_INPUT 
        : SELECTORS.DESCRIPTION_INPUT;
    
    const currentContent = document.querySelector(inputSelector)?.textContent || '';
    let messageType, data;

    switch (action) {
      case 'generate':
        const videoLink = getVideoLink();
        if (!videoLink) {
          throw new Error('No video link found');
        }
        messageType = 'GENERATE_CONTENT';
        data = { url: videoLink, choice: getChoiceForContentType(contentType) };
        break;
      
      case 'enhance':
        messageType = 'ENHANCE_CONTENT';
        data = { content: currentContent, type: contentType.toLowerCase() };
        break;
      
      case 'prompt':
        messageType = 'GENERATE_PROMPT';
        data = { content: currentContent, type: contentType.toLowerCase() };
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    chrome.runtime.sendMessage({ type: messageType, data }, response => {
      if (response.success) {
        updateInputField(inputSelector, response.data, button, contentType);
        showSuccessMessage(button, `${contentType} ${action}d successfully!`);
        
        const toolbar = button.closest('.toolbar');
        if (toolbar) {
          toolbar.classList.add('expanded');
        }
      } else {
        throw new Error(response.error);
      }
    });
  } catch (error) {
    console.error(`Error ${action}ing ${contentType}:`, error);
    showSuccessMessage(button, error.message || `Error ${action}ing ${contentType}`, true);
    updateButtonState(button, 'INITIAL');
  }
}