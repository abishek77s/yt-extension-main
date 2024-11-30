// Content generation service
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
    console.error(`Could not find ${contentType} input element with selector:`, selector);
    showSuccessMessage(button, `Error: Could not find ${contentType} input field`, true);
    updateButtonState(button, 'INITIAL');
  }
}

async function handleGeneration(button, contentType) {
  console.log(`Starting generation for ${contentType}`);

  try {
    updateButtonState(button, 'LOADING');
    
    const videoLink = getVideoLink();
    if (!videoLink) {
      console.error('No video link found');
      showSuccessMessage(button, 'Could not find video link', true);
      updateButtonState(button, 'INITIAL');
      return;
    }

    const choice = getChoiceForContentType(contentType);
    const response = await chrome.runtime.sendMessage({
      type: 'GENERATE_CONTENT',
      data: {
        contentType,
        prompt: videoLink,
        choice
      }
    });

    if (response.success) {
      console.log(`${contentType} generated successfully:`, response.data);
      showSuccessMessage(button, `${contentType} generated successfully!`);
      
      const inputSelector = contentType === 'Title' 
        ? window.SELECTORS.TITLE_INPUT 
        : window.SELECTORS.DESCRIPTION_INPUT;
      
      updateInputField(inputSelector, response.data, button, contentType);
      
      const toolbar = button.closest('.toolbar');
      if (toolbar) {
        toolbar.classList.add('expanded');
      }
    } else {
      console.error(`Error generating ${contentType}:`, response.error);
      showSuccessMessage(button, `Error generating ${contentType}`, true);
      updateButtonState(button, 'INITIAL');
    }
  } catch (error) {
    console.error(`Unhandled error generating ${contentType}:`, error);
    showSuccessMessage(button, `Unexpected error generating ${contentType}`, true);
    updateButtonState(button, 'INITIAL');
  }
}