/* ========================================================
   APPLICATION ENTRY POINT & ROUTER
   ======================================================== */

function navigateTo(pageId) {
  document.querySelectorAll('.page-section').forEach(el => el.classList.add('hidden'));
  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) {
    targetPage.classList.remove('hidden');
  }

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('text-indigo-600', 'bg-indigo-50');
    btn.classList.add('text-slate-600');
  });

  const activeNav = document.getElementById(`nav-${pageId}`);
  if (activeNav) {
    activeNav.classList.add('text-indigo-600', 'bg-indigo-50');
    activeNav.classList.remove('text-slate-600');
  }

  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.classList.add('hidden');
  }
}

function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.classList.toggle('hidden');
  }
}

// App initialization logic
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Auto-discover real_xxxx and ai_xxxx files inside image folders
  await initializeImagePools();

  // 2. Build the randomized 20-image challenge dataset
  quizDataset = generateQuizDataset();

  // 3. Mount training & quiz modules
  if (typeof loadTrainingCase === 'function') {
    loadTrainingCase();
  }
  if (typeof loadQuizCard === 'function') {
    loadQuizCard();
  }
});