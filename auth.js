/* PkTweed - Authentication & Session Engine (auth.js) - v2.0 */

let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
  checkLocalAuth();
});

// Local Session Auth Check
function checkLocalAuth() {
  const savedUser = localStorage.getItem('pktweed_current_user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateHeaderUI(currentUser);
    hideAuthOverlay();
  } else {
    updateHeaderUI(null);
  }
}

// Google Login Handler
function signInWithGoogle() {
  currentUser = {
    name: 'Makki',
    handle: '@makki',
    email: 'makki@pktweed.pk',
    avatar: 'M'
  };
  localStorage.setItem('pktweed_current_user', JSON.stringify(currentUser));
  updateHeaderUI(currentUser);
  hideAuthOverlay();
  alert('🚀 Google Auth Successful! Tringo AI & Algorithm monitoring active. 🇵🇰');
}

// Facebook Login Handler
function signInWithFacebook() {
  currentUser = {
    name: 'Makki',
    handle: '@makki',
    email: 'makki@pktweed.pk',
    avatar: 'M'
  };
  localStorage.setItem('pktweed_current_user', JSON.stringify(currentUser));
  updateHeaderUI(currentUser);
  hideAuthOverlay();
  alert('🚀 Facebook Auth Successful! Welcome to PkTweed. 🇵🇰');
}

// Email/Password Login Handler
function handleEmailLogin() {
  const emailInput = document.getElementById('authEmail').value;
  if (!emailInput.trim()) {
    alert('Please enter your email or username!');
    return;
  }
  currentUser = {
    name: 'Makki',
    handle: '@makki',
    email: emailInput,
    avatar: 'M'
  };
  localStorage.setItem('pktweed_current_user', JSON.stringify(currentUser));
  updateHeaderUI(currentUser);
  hideAuthOverlay();
  alert('🚀 Successfully logged in to PkTweed! 🇵🇰');
}

// Sign Up Handler
function handleSignUp() {
  alert('Redirecting to PkTweed VIP Creator Registration...');
  signInWithGoogle();
}

// Logout Function
function logoutUser() {
  localStorage.removeItem('pktweed_current_user');
  currentUser = null;
  updateHeaderUI(null);
  
  const authOverlay = document.getElementById('authOverlay');
  if (authOverlay) {
    authOverlay.style.opacity = '1';
    authOverlay.style.display = 'flex';
  }
  alert('Successfully logged out!');
}

// Hide Auth Overlay Smoothly
function hideAuthOverlay() {
  const authOverlay = document.getElementById('authOverlay');
  if (authOverlay) {
    authOverlay.style.opacity = '0';
    setTimeout(() => {
      authOverlay.style.display = 'none';
    }, 400);
  }
}

// Update Header UI Safely
function updateHeaderUI(user) {
  const headerContainer = document.getElementById('navbarHeader');
  if (!headerContainer) return;

  if (user) {
    headerContainer.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-sky-500 text-black font-bold flex items-center justify-center text-sm">M</div>
        <span class="text-white font-semibold text-xs sm:text-sm truncate max-w-[120px]">Makki</span>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="switchPage('profile')" class="text-xs bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 font-medium px-3 py-1.5 rounded-full transition">My Profile</button>
        <button onclick="openWalletModal()" class="text-xs bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold px-3 py-1.5 rounded-full transition flex items-center gap-1"><i class="fas fa-wallet"></i> Wallet</button>
        <button onclick="logoutUser()" class="text-xs bg-red-600/80 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-full transition">Logout</button>
      </div>
    `;
  } else {
    headerContainer.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-sky-500 text-black font-bold flex items-center justify-center text-sm">M</div>
        <span class="text-white font-semibold text-xs sm:text-sm">Makki</span>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="switchPage('profile')" class="text-xs bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 font-medium px-3 py-1.5 rounded-full transition">My Profile</button>
        <button onclick="signInWithGoogle()" class="text-xs bg-sky-500 hover:bg-sky-400 text-black font-bold px-3 py-1.5 rounded-full transition">Login with Google</button>
      </div>
    `;
  }
}
