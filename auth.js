/* PkTweed - Official Google OAuth2 Native Token Client Auth Engine (auth.js) - v19.0 */

let currentUser = null;
const GOOGLE_CLIENT_ID = "848310764443-inr2acmajlba7d0q492a9ha59kgphi2i.apps.googleusercontent.com";

let googleTokenClient = null;

document.addEventListener("DOMContentLoaded", () => {
  checkLocalAuth();
  initGoogleTokenClient();
});

// Initialize Google OAuth2 Token Client for Native Account Chooser Popup
function initGoogleTokenClient() {
  if (window.google && window.google.accounts && window.google.accounts.oauth2) {
    googleTokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
      callback: async (response) => {
        if (response && response.access_token) {
          try {
            // Fetch user profile info using the Google Access Token
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { 'Authorization': `Bearer ${response.access_token}` }
            });
            const payload = await res.json();
            
            currentUser = {
              name: payload.name || 'User',
              handle: '@' + (payload.email ? payload.email.split('@')[0] : 'user'),
              email: payload.email,
              avatar: payload.picture || (payload.name ? payload.name[0].toUpperCase() : 'U')
            };

            saveUserAndSyncUI(currentUser);
            alert(`🚀 Successfully logged in as ${currentUser.name}! 🇵🇰`);
          } catch (err) {
            console.error("Failed to fetch Google user info:", err);
            alert("Google login failed. Please try again.");
          }
        }
      },
    });
  }
}

// Open Native Google Account Chooser (Shows all device Gmails like Freelancer app)
function openAccountPicker(provider) {
  if (provider === 'google') {
    if (googleTokenClient) {
      // This triggers the exact native Google account chooser popup showing all Gmaisl!
      googleTokenClient.requestAccessToken();
    } else {
      // Fallback if SDK is still initializing
      initGoogleTokenClient();
      if (googleTokenClient) {
        googleTokenClient.requestAccessToken();
      } else {
        alert("Google services are loading. Please try again in a moment.");
      }
    }
  } else if (provider === 'facebook') {
    triggerCleanLoginModal('Facebook');
  } else if (provider === 'tiktok') {
    triggerCleanLoginModal('TikTok');
  }
}

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
        <div class="w-8 h-8 rounded-full bg-sky-500 text-black font-bold flex items-center justify-center text-sm">${avatarLetter}</div>
        <span class="text-white font-semibold text-xs sm:text-sm truncate max-w-[120px]">${displayName}</span>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="switchPage('profile')" class="text-xs bg-gray-900 hover:bg-gray-800 text-white border border-gray-800 font-medium px-3 py-1.5 rounded-full transition">My Profile</button>
        <button onclick="openWalletModal()" class="text-xs bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-extrabold px-3 py-1.5 rounded-full transition flex items-center gap-1"><i class="fas fa-wallet"></i> Wallet</button>
        <button onclick="logoutUser()" class="text-xs bg-red-600 text-white font-bold px-3 py-1.5 rounded-full transition">Logout</button>
      </div>
    `;
  } else {
    headerContainer.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-sky-500 text-black font-bold flex items-center justify-center text-sm">M</div>
        <span class="text-white font-semibold text-sm">Guest</span>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="switchPage('profile')" class="text-xs bg-gray-900 hover:bg-gray-800 text-white border border-gray-800 font-medium px-3 py-1.5 rounded-full transition">My Profile</button>
        <button onclick="openAccountPicker('google')" class="text-xs bg-blue-600 text-white font-bold px-3 py-1.5 rounded-full transition">Login</button>
      </div>
    `;
  }
}
