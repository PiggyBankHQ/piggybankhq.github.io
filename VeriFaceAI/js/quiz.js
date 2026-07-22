/* ========================================================
   SWIPE QUIZ ENGINE & INTERACTIVE CONTROLLER
   ======================================================== */

let quizIdx = 0;
let quizUserAnswers = [];

function loadQuizCard() {
  if (!quizDataset || quizDataset.length === 0) return;

  if (quizIdx >= quizDataset.length) {
    finishQuiz();
    return;
  }

  const item = quizDataset[quizIdx];
  const cardImg = document.getElementById('quiz-card-img');

  // Render actual image path; show fallback card if image file doesn't exist
  cardImg.onerror = () => { cardImg.src = item.fallbackSvg; };
  cardImg.src = item.img;

  document.getElementById('card-num').innerText = quizIdx + 1;
  document.getElementById('quiz-progress-text').innerText = `${quizIdx + 1} / ${quizDataset.length}`;
  document.getElementById('quiz-progress-bar').style.width = `${((quizIdx) / quizDataset.length) * 100}%`;

  const card = document.getElementById('quiz-card');
  card.style.transform = 'translate(0px, 0px) rotate(0deg)';
  card.style.opacity = '1';
  document.getElementById('overlay-real').style.opacity = '0';
  document.getElementById('overlay-ai').style.opacity = '0';
}

function handleSwipeChoice(userGuessedAI) {
  if (quizIdx >= quizDataset.length) return;

  quizUserAnswers.push({
    item: quizDataset[quizIdx],
    guessedAI: userGuessedAI,
    isCorrect: userGuessedAI === quizDataset[quizIdx].isAI
  });

  const card = document.getElementById('quiz-card');
  const moveX = userGuessedAI ? -300 : 300;

  card.style.transform = `translate(${moveX}px, -50px) rotate(${moveX / 10}deg)`;
  card.style.opacity = '0';

  setTimeout(() => {
    quizIdx++;
    loadQuizCard();
  }, 200);
}

function finishQuiz() {
  document.getElementById('quiz-card-container').classList.add('hidden');
  document.getElementById('quiz-controls').classList.add('hidden');

  const resultsEl = document.getElementById('quiz-results');
  resultsEl.classList.remove('hidden');

  const correctCount = quizUserAnswers.filter(a => a.isCorrect).length;
  const percentage = Math.round((correctCount / quizDataset.length) * 100);

  document.getElementById('final-score').innerText = `${correctCount} / ${quizDataset.length}`;
  document.getElementById('final-percentage').innerText = `${percentage}%`;
  document.getElementById('quiz-progress-bar').style.width = `100%`;
}

function resetQuiz() {
  quizIdx = 0;
  quizUserAnswers = [];

  // Generate a new 20-card randomized round from discovered pools
  quizDataset = generateQuizDataset();

  document.getElementById('quiz-card-container').classList.remove('hidden');
  document.getElementById('quiz-controls').classList.remove('hidden');
  document.getElementById('quiz-results').classList.add('hidden');
  loadQuizCard();
}

/* Touch & Drag Event Handlers for Swiping */
(function setupSwipeHandlers() {
  window.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('quiz-card');
    if (!card) return;

    let startX = 0, startY = 0, currentX = 0, currentY = 0;
    let isDragging = false;

    function onStart(e) {
      isDragging = true;
      startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientY;
      startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    }

    function onMove(e) {
      if (!isDragging) return;
      const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const y = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
      currentX = x - startX;
      currentY = y - startY;

      card.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${currentX / 15}deg)`;

      if (currentX > 30) {
        document.getElementById('overlay-real').style.opacity = Math.min(currentX / 100, 1);
        document.getElementById('overlay-ai').style.opacity = '0';
      } else if (currentX < -30) {
        document.getElementById('overlay-ai').style.opacity = Math.min(-currentX / 100, 1);
        document.getElementById('overlay-real').style.opacity = '0';
      } else {
        document.getElementById('overlay-real').style.opacity = '0';
        document.getElementById('overlay-ai').style.opacity = '0';
      }
    }

    function onEnd() {
      if (!isDragging) return;
      isDragging = false;

      if (currentX > 100) {
        handleSwipeChoice(false); // Right = Real
      } else if (currentX < -100) {
        handleSwipeChoice(true);  // Left = AI
      } else {
        card.style.transform = 'translate(0px, 0px) rotate(0deg)';
        document.getElementById('overlay-real').style.opacity = '0';
        document.getElementById('overlay-ai').style.opacity = '0';
      }
      currentX = 0; currentY = 0;
    }

    card.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    card.addEventListener('touchstart', onStart);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  });
})();