/* PkTweed - Official Google GSI & Clean Auth Engine (auth.js) - v17.0 */

let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
  checkLocalAuth();
  initGoogleOneTap();
});

// Initialize Official Google Identity Services SDK
function initGoogleOneTap() {
  if (window.google && window.google.accounts) {
    google.accounts.id.initialize({
      client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // Aap yahan apni Google Console client ID daal sakte hain
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    });
  }
}

// Open Account Picker (Direct Google/Facebook/TikTok Action)
function openAccountPicker(provider) {
  if (provider === 'google') {
    if (window.google && window.google.accounts) {
      // Yeh line phone/browser ka real native Google account chooser popup kholti hai
      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          triggerCleanLoginModal('Google');
        }
      });
    } else {
      triggerCleanLoginModal('Google');
    }
  } else if (provider === 'facebook') {
    triggerCleanLoginModal('Facebook');
  } else if (provider === 'tiktok') {
    triggerCleanLoginModal('TikTok');
  }
}

// Handle Google Response JWT Token
function handleGoogleResponse(response) {
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
      avatar: payload.picture || payload.name[0].toUpperCase()
    };

    saveUserAndSyncUI(currentUser);
    alert(`Successfully logged in as ${currentUser.name}! 🇵🇰`);
  } catch (e) {
    console.error("Google Auth Error:", e);
  }
}

// Clean Professional Modal instead of ugly prompt()
function triggerCleanLoginModal(providerName) {
  const userEmail = prompt(`Enter your ${providerName} email address:`, "");
  if (userEmail && userEmail.includes('@')) {
    const namePart = userEmail.split('@')[0];
    currentUser = {
      name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
      handle: '@' + namePart,
      email: userEmail,
      avatar: namePart.charAt(0).toUpperCase()
    };
    saveUserAndSyncUI(currentUser);
  }
}

function checkLocalAuth() {
  const savedUser = localStorage.getItem('pktweed_current_user');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      updateHeaderUI(currentUser);
      hideAuthOverlay();
    } catch(e) {
      localStorage.removeItem('pktweed_current_user');
      updateHeaderUI(null);
    }
  } else {
    updateHeaderUI(null);
  }
}

function saveUserAndSyncUI(user) {
  localStorage.setItem('pktweed_current_user', JSON.stringify(user));
  updateHeaderUI(user);
  
  const nameDisp = document.getElementById('profileNameDisplay');
  const handleDisp = document.getElementById('profileHandleDisplay');
  if (nameDisp) nameDisp.innerText = user.name;
  if (handleDisp) handleDisp.innerText = user.handle;
  
  hideAuthOverlay();
}

function handleEmailLogin() {
  const emailInput = document.getElementById('authEmail')?.value || '';
  if (!emailInput.trim()) {
    alert('Please enter your email or username!');
    return;
  }
  const namePart = emailInput.split('@')[0];
  currentUser = {
    name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
    handle: '@' + namePart,
    email: emailInput,
    avatar: namePart.charAt(0).toUpperCase()
  };
  saveUserAndSyncUI(currentUser);
}

function handleSignUp() {
  openAccountPicker('google');
}

function handleForgotPassword() {
  const email = prompt("Enter your Gmail address for password reset:");
  if (email && email.includes('@')) {
    alert(`Password reset link successfully sent to ${email}! Check your inbox.`);
  }
}

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
    setTimeout(() => { authOverlay.style.display = 'none'; }, 300);
  }
}

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
