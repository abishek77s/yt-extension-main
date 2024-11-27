const SELECTORS = {
  TITLE_INPUT: '#textbox.style-scope.ytcp-social-suggestions-textbox',
  DESCRIPTION_INPUT: '#description-textarea #textbox.style-scope.ytcp-social-suggestions-textbox',
  VIDEO_LINK: '.video-url-fadeable.style-scope.ytcp-video-info a'
};

const BUTTON_STATES = {
  INITIAL: {
    text: 'Generate',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>'
  },
  LOADING: {
    text: 'Loading...',
    icon: '<svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>'
  },
  REGENERATE: {
    text: 'Regenerate',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 12c0-4.4 3.6-8 8-8 3.3 0 6.2 2 7.4 5M22 12c0 4.4-3.6 8-8 8-3.3 0-6.2-2-7.4-5"></path></svg>'
  }
};

const BUTTON_STYLES = `
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  margin: 0 4px;
  border: none;
  border-radius: 18px;
  background: #065fd4;
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
`;

const CONTAINER_STYLES = `
  display: flex;
  align-items: center;
  margin: 8px 0;
  gap: 4px;
`;

function createButton(contentType) {
  const button = document.createElement('button');
  const state = BUTTON_STATES.INITIAL;
  button.innerHTML = `${state.icon} ${state.text} ${contentType}`;
  button.style.cssText = BUTTON_STYLES;
  button.dataset.contentType = contentType;
  button.dataset.state = 'initial';
  return button;
}

function updateButtonState(button, state) {
  const contentType = button.dataset.contentType;
  const buttonState = BUTTON_STATES[state];
  button.innerHTML = `${buttonState.icon} ${buttonState.text} ${contentType}`;
  button.dataset.state = state.toLowerCase();
  button.disabled = state === 'LOADING';
}

function createButtonContainer() {
  const container = document.createElement('div');
  container.style.cssText = CONTAINER_STYLES;
  return container;
}

function showSuccessMessage(element, message, isError = false) {
  const successDiv = document.createElement('div');
  successDiv.style.cssText = `
    color: ${isError ? '#d32f2f' : '#0f9d58'};
    font-size: 12px;
    margin: 4px 0;
  `;
  successDiv.textContent = message;
  element.parentElement.appendChild(successDiv);
  setTimeout(() => successDiv.remove(), 3000);
}

function getVideoLink() {
  const linkElement = document.querySelector(SELECTORS.VIDEO_LINK);
  return linkElement ? linkElement.href : null;
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

    let choice;
    switch (contentType.toLowerCase()) {
      case 'title':
        choice = 1;
        break;
      case 'description':
        choice = 2;
        break;
      case 'tags':
        choice = 3;
        break;
      default:
        choice = 1;
    }

    console.log('Sending message to background script...');
    const response = await chrome.runtime.sendMessage({
      type: 'GENERATE_CONTENT',
      data: {
        contentType,
        prompt: videoLink,
        choice
      }
    });

    console.log('Received response:', response);

    if (response.success) {
      console.log(`${contentType} generated successfully:`, response.data);
      showSuccessMessage(button, `${contentType} generated successfully!`);
      
      const inputSelector = contentType === 'Title' 
        ? SELECTORS.TITLE_INPUT 
        : SELECTORS.DESCRIPTION_INPUT;
      
      const inputElement = document.querySelector(inputSelector);
      
      if (inputElement) {
        console.log(`Setting ${contentType} input value:`, response.data);
        
        inputElement.textContent = response.data;
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
        
        const inputEvent = new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText',
          data: response.data
        });
        inputElement.dispatchEvent(inputEvent);
        
        inputElement.focus();
        inputElement.blur();
        
        updateButtonState(button, 'REGENERATE');
      } else {
        console.error(`Could not find ${contentType} input element with selector:`, inputSelector);
        showSuccessMessage(button, `Error: Could not find ${contentType} input field`, true);
        updateButtonState(button, 'INITIAL');
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

function injectControls() {
  const titleInput = document.querySelector(SELECTORS.TITLE_INPUT);
  const descriptionInput = document.querySelector(SELECTORS.DESCRIPTION_INPUT);

  if (titleInput && descriptionInput) {
    const titleContainer = createButtonContainer();
    const titleButton = createButton('Title');
    titleButton.addEventListener('click', () => handleGeneration(titleButton, 'Title'));

    const descriptionContainer = createButtonContainer();
    const descriptionButton = createButton('Description');
    descriptionButton.addEventListener('click', () => handleGeneration(descriptionButton, 'Description'));

    const tagsContainer = createButtonContainer();
    const tagsButton = createButton('Tags');
    tagsButton.addEventListener('click', () => handleGeneration(tagsButton, 'Tags'));

    titleContainer.appendChild(titleButton);
    descriptionContainer.appendChild(descriptionButton);
    tagsContainer.appendChild(tagsButton);

    titleInput.parentElement.insertBefore(titleContainer, titleInput);
    descriptionInput.parentElement.insertBefore(descriptionContainer, descriptionInput);
    descriptionInput.parentElement.insertBefore(tagsContainer, descriptionInput.nextSibling);
  }
}

const observer = new MutationObserver((mutations, obs) => {
  const titleInput = document.querySelector(SELECTORS.TITLE_INPUT);
  if (titleInput) {
    console.log('YouTube Studio page detected. Injecting controls...');
    injectControls();
    obs.disconnect();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spin {
    animation: spin 1s linear infinite;
  }
  button[data-state="regenerate"] {
    background: #34a853;
  }
  button[data-state="loading"] {
    background: #9aa0a6;
    cursor: not-allowed;
  }
`;
document.head.appendChild(styleSheet);

console.log('YouTube Studio Enhancer content script loaded.');