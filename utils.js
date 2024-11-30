function createButton(contentType, isSecondary = false) {
  const button = document.createElement('button');
  const state = BUTTON_STATES.INITIAL;
  button.innerHTML = state.icon;
  button.className = `toolbar-button${isSecondary ? ' secondary' : ''}`;
  button.dataset.contentType = contentType;
  button.dataset.state = 'initial';
  button.title = `${state.text} ${contentType}`;
  return button;
}

function updateButtonState(button, state) {
  const contentType = button.dataset.contentType;
  const buttonState = BUTTON_STATES[state];
  button.innerHTML = buttonState.icon;
  button.dataset.state = state.toLowerCase();
  button.disabled = state === 'LOADING';
  button.title = `${buttonState.text} ${contentType}`;
}

function createButtonContainer() {
  const container = document.createElement('div');
  container.className = 'toolbar';
  
  const innerContainer = document.createElement('div');
  innerContainer.className = 'toolbar-inner';
  
  container.appendChild(innerContainer);
  return { container, innerContainer };
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

// This function is no longer needed since we're using a separate CSS file
function injectGlobalStyles() {
  // No-op: styles are now loaded via manifest.json
}