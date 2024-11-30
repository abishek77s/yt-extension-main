// Initialize the extension
function injectControls() {
  const titleInput = document.querySelector(SELECTORS.TITLE_INPUT);
  const descriptionInput = document.querySelector(SELECTORS.DESCRIPTION_INPUT);

  if (titleInput && descriptionInput) {
    const titleInputContainer = titleInput.parentElement;
    const descInputContainer = descriptionInput.parentElement;
    
    // Make parent containers relative for absolute positioning
    titleInputContainer.style.position = 'relative';
    descInputContainer.style.position = 'relative';

    injectToolbar(titleInputContainer, 'Title');
    injectToolbar(descInputContainer, 'Description');
  }
}

function injectToolbar(container, contentType) {
  const { container: toolbarContainer, innerContainer } = createButtonContainer();
  
  // Create main generate button
  const generateButton = createButton(contentType);
  generateButton.addEventListener('click', () => handleGeneration(generateButton, contentType, 'generate'));
  
  // Create enhance button
  const enhanceButton = createButton(contentType, true);
  enhanceButton.addEventListener('click', () => handleGeneration(enhanceButton, contentType, 'enhance'));
  
  // Create prompt button
  const promptButton = createButton(contentType, true);
  promptButton.addEventListener('click', () => handleGeneration(promptButton, contentType, 'prompt'));
  
  innerContainer.appendChild(generateButton);
  innerContainer.appendChild(enhanceButton);
  innerContainer.appendChild(promptButton);
  
  container.appendChild(toolbarContainer);
}

// Initialize mutation observer to detect when YouTube Studio loads
const observer = new MutationObserver((mutations, obs) => {
  const titleInput = document.querySelector(SELECTORS.TITLE_INPUT);
  if (titleInput) {
    console.log('YouTube Studio page detected. Injecting controls...');
    injectControls();
    obs.disconnect();
  }
});

// Start observing the document
observer.observe(document.body, {
  childList: true,
  subtree: true
});