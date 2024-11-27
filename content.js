const SELECTORS = {
  TITLE_INPUT: '#textbox.style-scope.ytcp-social-suggestions-textbox',
  DESCRIPTION_INPUT: '#description-textarea #textbox.style-scope.ytcp-social-suggestions-textbox',
  VIDEO_LINK: '.video-url-fadeable.style-scope.ytcp-video-info a'
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

function createButton(text) {
  const button = document.createElement('button');
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
    ${text}
  `;
  button.style.cssText = BUTTON_STYLES;
  return button;
}

function createButtonContainer() {
  const container = document.createElement('div');
  container.style.cssText = CONTAINER_STYLES;
  return container;
}

function setButtonLoading(button, isLoading) {
  const originalContent = button.innerHTML;

  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `
      <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
      </svg>
      Loading...
    `;
  } else {
    button.disabled = false;
    button.innerHTML = originalContent;
  }
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
    setButtonLoading(button, true);
    
    const videoLink = getVideoLink();
    if (!videoLink) {
      console.error('No video link found');
      showSuccessMessage(button, 'Could not find video link', true);
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
      } else {
        console.error(`Could not find ${contentType} input element with selector:`, inputSelector);
        showSuccessMessage(button, `Error: Could not find ${contentType} input field`, true);
      }
    } else {
      console.error(`Error generating ${contentType}:`, response.error);
      showSuccessMessage(button, `Error generating ${contentType}`, true);
    }
  } catch (error) {
    console.error(`Unhandled error generating ${contentType}:`, error);
    showSuccessMessage(button, `Unexpected error generating ${contentType}`, true);
  } finally {
    setButtonLoading(button, false);
  }
}

function injectControls() {
  const titleInput = document.querySelector(SELECTORS.TITLE_INPUT);
  const descriptionInput = document.querySelector(SELECTORS.DESCRIPTION_INPUT);

  if (titleInput && descriptionInput) {
    const titleContainer = createButtonContainer();
    const titleButton = createButton('Generate Title');
    titleButton.addEventListener('click', () => handleGeneration(titleButton, 'Title'));

    const descriptionContainer = createButtonContainer();
    const descriptionButton = createButton('Generate Description');
    descriptionButton.addEventListener('click', () => handleGeneration(descriptionButton, 'Description'));

    const tagsContainer = createButtonContainer();
    const tagsButton = createButton('Generate Tags');
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
`;
document.head.appendChild(styleSheet);

console.log('YouTube Studio Enhancer content script loaded.');