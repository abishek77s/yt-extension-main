// Initialize the extension
function injectControls() {
  const titleInput = document.querySelector(window.SELECTORS.TITLE_INPUT);
  const descriptionInput = document.querySelector(window.SELECTORS.DESCRIPTION_INPUT);

  if (titleInput && descriptionInput) {
    const titleInputContainer = titleInput.parentElement;
    const descInputContainer = descriptionInput.parentElement;
    
    titleInputContainer.style.position = 'relative';
    descInputContainer.style.position = 'relative';

    const { container: titleContainer, innerContainer: titleInner } = createButtonContainer();
    const titleButton = createButton('Title');
    const enhanceButton = createButton('Enhance', true);
    const promptButton = createButton('Prompt', true);

    titleButton.addEventListener('click', () => handleGeneration(titleButton, 'Title'));
    enhanceButton.addEventListener('click', () => handleGeneration(enhanceButton, 'Enhance'));
    promptButton.addEventListener('click', () => handleGeneration(promptButton, 'Prompt'));

    titleInner.appendChild(titleButton);
    titleInner.appendChild(enhanceButton);
    titleInner.appendChild(promptButton);

    const { container: descContainer, innerContainer: descInner } = createButtonContainer();
    const descButton = createButton('Description');
    const descEnhanceButton = createButton('Enhance', true);
    const descPromptButton = createButton('Prompt', true);

    descButton.addEventListener('click', () => handleGeneration(descButton, 'Description'));
    descEnhanceButton.addEventListener('click', () => handleGeneration(descEnhanceButton, 'Enhance'));
    descPromptButton.addEventListener('click', () => handleGeneration(descPromptButton, 'Prompt'));

    descInner.appendChild(descButton);
    descInner.appendChild(descEnhanceButton);
    descInner.appendChild(descPromptButton);

    titleInputContainer.appendChild(titleContainer);
    descInputContainer.appendChild(descContainer);
  }
}

// Initialize mutation observer to detect when YouTube Studio loads
const observer = new MutationObserver((mutations, obs) => {
  const titleInput = document.querySelector(window.SELECTORS.TITLE_INPUT);
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