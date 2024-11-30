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

    const { container: tagsContainer, innerContainer: tagsInner } = createButtonContainer();
    const tagsButton = createButton('Tags');
    const tagsEnhanceButton = createButton('Enhance', true);
    const tagsPromptButton = createButton('Prompt', true);

    tagsButton.addEventListener('click', () => handleGeneration(tagsButton, 'Tags'));
    tagsEnhanceButton.addEventListener('click', () => handleGeneration(tagsEnhanceButton, 'Enhance'));
    tagsPromptButton.addEventListener('click', () => handleGeneration(tagsPromptButton, 'Prompt'));

    tagsInner.appendChild(tagsButton);
    tagsInner.appendChild(tagsEnhanceButton);
    tagsInner.appendChild(tagsPromptButton);

    titleInputContainer.appendChild(titleContainer);
    descInputContainer.appendChild(descContainer);
    descInputContainer.appendChild(tagsContainer);
  }
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