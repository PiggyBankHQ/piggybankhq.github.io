/* ========================================================
   TRAINING MODULE CONTROLLER
   Handles interactive drills and forensic feedback
   ======================================================== */

let currentTrainingIndex = 0;

/**
 * Renders the current case in the Training Module
 */
function renderTrainingCase() {
  if (!trainingDataset || trainingDataset.length === 0) return;

  const currentCase = trainingDataset[currentTrainingIndex];
  
  const imgElement = document.getElementById('training-img');
  const indexElement = document.getElementById('training-index');
  const buttonsContainer = document.getElementById('training-buttons');
  const feedbackContainer = document.getElementById('training-feedback');

  if (!imgElement) return;

  // Set counter text
  if (indexElement) {
    indexElement.textContent = `${currentTrainingIndex + 1} of ${trainingDataset.length}`;
  }

  // Set image source with graceful error fallback
  imgElement.onerror = function() {
    this.onerror = null; // Prevent infinite loop
    this.src = currentCase.fallbackSvg || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1024' height='1024' viewBox='0 0 1024 1024'><rect width='1024' height='1024' fill='%23f1f5f9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='28' fill='%2364748b'>Training Image Not Found</text></svg>";
  };
  
  imgElement.src = currentCase.img;

  // Reset UI state
  if (buttonsContainer) buttonsContainer.classList.remove('hidden');
  if (feedbackContainer) {
    feedbackContainer.classList.add('hidden');
    feedbackContainer.className = 'hidden rounded-xl p-4 transition-all';
  }
}

/**
 * Handles user guess (Real vs AI) in training mode
 */
function submitTrainingGuess(userGuessedAI) {
  const currentCase = trainingDataset[currentTrainingIndex];
  const isCorrect = userGuessedAI === currentCase.isAI;

  const buttonsContainer = document.getElementById('training-buttons');
  const feedbackContainer = document.getElementById('training-feedback');
  const feedbackHeader = document.getElementById('feedback-header');
  const feedbackText = document.getElementById('feedback-text');

  if (buttonsContainer) buttonsContainer.classList.add('hidden');

  if (feedbackContainer && feedbackHeader && feedbackText) {
    feedbackContainer.classList.remove('hidden');

    if (isCorrect) {
      feedbackContainer.classList.add('bg-emerald-50', 'border', 'border-emerald-200', 'text-emerald-900');
      feedbackHeader.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600 text-xl"></i><span class="text-emerald-700">Correct Assessment!</span>`;
    } else {
      feedbackContainer.classList.add('bg-rose-50', 'border', 'border-rose-200', 'text-rose-900');
      feedbackHeader.innerHTML = `<i class="fa-solid fa-circle-xmark text-rose-600 text-xl"></i><span class="text-rose-700">Incorrect</span>`;
    }

    feedbackText.textContent = currentCase.reason || "Examine key features like eye symmetry, hairline boundaries, and background coherence.";
  }
}

/**
 * Moves to the next case in the training suite
 */
function nextTrainingCase() {
  currentTrainingIndex = (currentTrainingIndex + 1) % trainingDataset.length;
  renderTrainingCase();
}