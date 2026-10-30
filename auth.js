/* PkTweed - Real Google Identity Services (GSI) Auth Engine (auth.js) - v12.0 */

let currentUser = null;

// Initialize Google Identity Services SDK on Load
document.addEventListener("DOMContentLoaded", () => {
  checkLocalAuth();
  initGoogleGSI();
});

function initGoogleGSI() {
  if (window.google && window.google.accounts) {
    google.accounts.id.initialize({
      client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // Replace with your Google Cloud Client ID when live
      callback: handleGoogleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    });
  }
}

// Real Google Account Selection Trigger
function openAccountPicker(provider) {
  if (provider === 'google') {
    signInWithGoogle();
  } else if (provider === 'facebook') {
    signInWithFacebook();
  } else if (provider === 'tiktok') {
    signInWithTikTok();
  }
}

function signInWithGoogle() {
  if (window.google && window.google.accounts) {
    // Triggers native mobile/browser Google account chooser pop-up
    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        fallbackManualEmailPrompt('Google');
      }
    });
  } else {
    fallbackManualEmailPrompt('Google');
  }
}

// Handle Real Google JWT Credential Response
function handleGoogleCredentialResponse(response) {
  try {
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    currentUser = {
      name: payload.name || 'User',
      handle: '@' + (payload.email ? payload.email.split('@')[0] : 'user'),
      email: payload.email,
      avatar: payload.picture || (payload.name ? payload.name[0].toUpperCase() : 'U')
    };

    saveUserAndSyncUI(currentUser);
    alert(`🚀 Successfully logged in with real Google Account (${payload.email})! 🇵🇰`);
  } catch (e) {
    console.error("Google Auth Decode Error:", e);
  }
}

function signInWithFacebook() {
  const fbEmail = prompt("Enter your Facebook Email or Username:", "");
  if (fbEmail && fbEmail.trim()) {
    processSocialLogin(fbEmail, 'Facebook');
  }
}

function signInWithTikTok() {
  const tkHandle = prompt("Enter your TikTok Username:", "@");
  if (tkHandle && tkHandle.trim()) {
    processSocialLogin(tkHandle, 'TikTok');
  }
}

function fallbackManualEmailPrompt(providerName) {
  const userEmail = prompt(`Enter your real ${providerName} Email:`, "");
  if (userEmail && userEmail.includes('@')) {
    processSocialLogin(userEmail, providerName);
  }
}

function processSocialLogin(identifier, providerName) {
  const cleanId = identifier.replace('@', '');
  const namePart = cleanId.split('@')[0];
  currentUser = {
    name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
    handle: '@' + namePart,
    email: identifier.includes('@') ? identifier : identifier + '@' + providerName.toLowerCase() + '.com',
    avatar: namePart.charAt(0).toUpperCase()
  };
  saveUserAndSyncUI(currentUser);
}

// Local Session Auth Check
function checkLocalAuth() {
  const savedUser = localStorage.getItem('pktweed_current_user');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      updateHeaderUI(currentUser);
      hideAuthOverlay();
    } catch (e) {
      localStorage.removeItem('pktweed_current_user');
      updateHeaderUI(null);
    }
  } else {
    updateHeaderUI(null);
  }
}

// Save User Session & Sync UI Elements
function saveUserAndSyncUI(user) {
  localStorage.setItem('pktweed_current_user', JSON.stringify(user));
  updateHeaderUI(user);
  
  const nameDisp = document.getElementById('profileNameDisplay');
  const handleDisp = document.getElementById('profileHandleDisplay');
  if (nameDisp) nameDisp.innerText = user.name;
  if (handleDisp) handleDisp.innerText = user.handle;
  
  hideAuthOverlay();
}

// Manual Form Login
function handleEmailLogin() {
  const emailInput = document.getElementById('authEmail')?.value || '';
  if (!emailInput.trim()) {
    alert('Please enter your email or username!');
    return;
  }
  processSocialLogin(emailInput, 'Email');
}

function handleSignUp() {
  signInWithGoogle();
}

// Logout Action
function logoutUser() {
  localStorage.removeItem('pktweed_current_user');
  currentUser = null;
  updateHeaderUI(null);
  const authOverlay = document.getElementById('authOverlay');
  if (authOverlay) {
    authOverlay.style.opacity = '1';
    authOverlay.style.display = 'flex';
  }
}

function hideAuthOverlay() {
  const authOverlay = document.getElementById('authOverlay');
  if (authOverlay) {
    authOverlay.style.opacity = '0';
    setTimeout(() => { 
      authOverlay.style.display = 'none'; 
    }, 300);
  }
}

// Dynamic Header UI Handler
function updateHeaderUI(user) {
  const headerContainer = document.getElementById('navbarHeader');
  if (!headerContainer) return;

  const displayName = user ? user.name : 'Makki';
  const avatarLetter = user ? user.avatar : 'M';

  if (user) {
    headerContainer.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center text-sm">${avatarLetter}</div>
        <span class="text-gray-900 font-semibold text-xs sm:text-sm truncate max-w-[120px]">${displayName}</span>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="switchPage('profile')" class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 font-medium px-3 py-1.5 rounded-full transition">My Profile</button>
        <button onclick="openWalletModal()" class="text-xs bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-full transition flex items-center gap-1"><i class="fas fa-wallet"></i> Wallet</button>
        <button onclick="logoutUser()" class="text-xs bg-red-600 text-white font-bold px-3 py-1.5 rounded-full transition">Logout</button>
      </div>
    `;
  } else {
    headerContainer.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center text-sm">M</div>
        <span class="text-gray-900 font-semibold text-sm">Guest</span>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="switchPage('profile')" class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 font-medium px-3 py-1.5 rounded-full transition">My Profile</button>
        <button onclick="openAccountPicker('google')" class="text-xs bg-blue-600 text-white font-bold px-3 py-1.5 rounded-full transition">Login</button>
      </div>
    `;
  }
                      }
    
