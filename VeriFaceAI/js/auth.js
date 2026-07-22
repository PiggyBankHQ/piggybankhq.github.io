/* ========================================================
   AUTHENTICATION & GOOGLE OAUTH POPUP CONTROLLER
   ======================================================== */

// Set your real Google Client ID here once hosted/configured in Google Cloud Console
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

// Currently logged in user state
let currentUser = null;

/**
 * Opens the authentication modal in Login or Sign-Up state
 */
function openAuthModal(mode = 'login') {
  const modal = document.getElementById('auth-modal');
  const title = document.getElementById('auth-modal-title');
  const subtitle = document.getElementById('auth-modal-subtitle');

  if (title && subtitle) {
    if (mode === 'signup') {
      title.textContent = 'Create your account';
      subtitle.textContent = 'Register with Google to track your training stats and join the global benchmark leaderboard.';
    } else {
      title.textContent = 'Welcome back';
      subtitle.textContent = 'Log in with Google to resume your face detection drills and view score history.';
    }
  }

  if (modal) {
    modal.classList.remove('hidden');
  }
}

/**
 * Closes the authentication modal
 */
function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

/**
 * Triggers Google OAuth sign-in flow
 */
function triggerGoogleAuth() {
  // If running locally with the placeholder ID, trigger local mock sign-in
  if (GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID')) {
    handleMockLocalLogin();
    return;
  }

  // Real Google OAuth Flow
  const redirectUri = window.location.origin + window.location.pathname;
  const scope = 'openid profile email';
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=token` +
    `&scope=${encodeURIComponent(scope)}`;

  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    authUrl,
    'Google OAuth Sign-In',
    `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
  );

  if (popup) {
    popup.focus();
    closeAuthModal();
  } else {
    alert('Pop-up blocked! Please allow pop-ups for this site to log in with Google.');
  }
}

/**
 * Simulates a successful login for local testing without Google Cloud setup
 */
function handleMockLocalLogin() {
  currentUser = {
    name: 'Demo Researcher',
    email: 'researcher@veriface.ai',
    picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VeriFace'
  };

  closeAuthModal();
  updateUIForLoggedInUser();
  alert(`Logged in successfully (Dev Mode) as ${currentUser.name}!`);
}

/**
 * Updates navbar to show user profile icon when logged in
 */
function updateUIForLoggedInUser() {
  if (!currentUser) return;

  const authButtons = document.querySelectorAll('button[onclick*="openAuthModal"]');
  authButtons.forEach(btn => {
    btn.classList.add('hidden');
  });

  // Highlight active session in mobile menu / header if container exists
  const headerActions = document.querySelector('header .hidden.md\\:flex');
  if (headerActions && !document.getElementById('user-profile-badge')) {
    const badge = document.createElement('div');
    badge.id = 'user-profile-badge';
    badge.className = 'flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-900';
    badge.innerHTML = `
      <img src="${currentUser.picture}" alt="Avatar" class="w-6 h-6 rounded-full border border-indigo-300">
      <span>${currentUser.name}</span>
    `;
    headerActions.appendChild(badge);
  }
}

// Close auth modal when clicking background overlay
window.addEventListener('click', (event) => {
  const modal = document.getElementById('auth-modal');
  if (event.target === modal) {
    closeAuthModal();
  }
});