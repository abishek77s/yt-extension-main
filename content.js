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
    
    // Set up observer for Show More button
    setupShowMoreObserver();
  }
}

function setupShowMoreObserver() {
  // Create a new observer for the Show More button
  const showMoreObserver = new MutationObserver((mutations, obs) => {
    const showMoreButton = document.querySelector(SELECTORS.SHOW_MORE_BUTTON);
    if (showMoreButton && !showMoreButton.dataset.enhancerInitialized) {
      console.log('Show More button detected. Adding click listener...');
      
      showMoreButton.addEventListener('click', handleShowMoreClick);
      showMoreButton.dataset.enhancerInitialized = 'true';
    }
  });

  // Start observing
  showMoreObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function handleShowMoreClick() {
  console.log('Show More button clicked. Setting up tags observer...');
  
  // Create observer for tags input
  const tagsObserver = new MutationObserver((mutations, obs) => {
    const tagsContainer = document.querySelector(SELECTORS.TAGS_CONTAINER);
    const tagsInput = document.querySelector(SELECTORS.TAGS_INPUT);
    
    if (tagsInput && tagsContainer && !tagsContainer.dataset.enhancerInitialized) {
      console.log('Tags input detected. Injecting toolbar...');
      
      // Create a wrapper div for the toolbar
      const toolbarWrapper = document.createElement('div');
      toolbarWrapper.className = 'toolbar-wrapper';
      toolbarWrapper.style.cssText = `
        position: relative;
        margin-top: 16px;
        margin-bottom: 8px;
      `;
      
      // Insert the wrapper before the tags input container
      tagsContainer.insertBefore(toolbarWrapper, tagsContainer.firstChild);
      
      // Inject toolbar into the wrapper
      injectToolbar(toolbarWrapper, 'Tags');
      
      // Mark as initialized
      tagsContainer.dataset.enhancerInitialized = 'true';
      
      // Stop observing once toolbar is injected
      obs.disconnect();
    }
  });

  // Start observing for tags input
  tagsObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
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