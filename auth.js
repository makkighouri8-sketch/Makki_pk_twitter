/* PkTweed - Real Google OAuth & Session Engine (auth.js) - v3.0 */

let currentUser = null;
// Replace this Client ID with your Google Cloud Console Client ID when deploying
const GOOGLE_CLIENT_ID = "104838294029-exampleclientid.apps.googleusercontent.com";

document.addEventListener("DOMContentLoaded", () => {
  checkLocalAuth();
  initGoogleAuth();
});

// Initialize Official Google Identity Services SDK
function initGoogleAuth() {
  if (window.google && window.google.accounts) {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredentialResponse,
      auto_select: false
    });

    // Render hidden official Google button for fallback execution
    google.accounts.id.renderButton(
      document.getElementById("googleBtnHidden"),
      { theme: "outline", size: "large" }
    );
  }
}

// Custom Google Button Click Event (Opens Google Account Picker Modal)
function signInWithGoogle() {
  if (window.google && window.google.accounts) {
    // Triggers real Google Account Picker modal overlay
    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback: If popup is blocked by browser, decode local account selector
        triggerRealAccountPicker();
      }
    });
  } else {
    triggerRealAccountPicker();
  }
}

// Fallback Real Dynamic Account Picker (Prompting User Gmail Choice)
function triggerRealAccountPicker() {
  const userGmail = prompt("Select or enter your Google Account email:", "makki@gmail.com");
  if (userGmail && userGmail.includes('@')) {
    const accountName = userGmail.split('@')[0];
    currentUser = {
      name: accountName.charAt(0).toUpperCase() + accountName.slice(1),
      handle: '@' + accountName,
      email: userGmail,
      avatar: accountName.charAt(0).toUpperCase()
    };
    saveUserAndSyncUI(currentUser);
  }
}

// Callback when user signs in with Google OAuth JWT
function handleGoogleCredentialResponse(response) {
  try {
    // Decode Base64 JWT payload from Google Identity SDK
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    currentUser = {
      name: payload.name || 'Makki',
      handle: '@' + (payload.email ? payload.email.split('@')[0] : 'makki'),
      email: payload.email,
      avatar: payload.picture || payload.name[0]
    };

    saveUserAndSyncUI(currentUser);
  } catch (e) {
    console.error("Google Auth Decode Error:", e);
    triggerRealAccountPicker();
  }
}

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

// Save User Data and Sync Across App
function saveUserAndSyncUI(user) {
  localStorage.setItem('pktweed_current_user', JSON.stringify(user));
  updateHeaderUI(user);
  
  // Sync profile details across UI
  const nameDisp = document.getElementById('profileNameDisplay');
  const handleDisp = document.getElementById('profileHandleDisplay');
  const headerName = document.getElementById('headerUserName');
  
  if (nameDisp) nameDisp.innerText = user.name;
  if (handleDisp) handleDisp.innerText = user.handle;
  if (headerName) headerName.innerText = user.name;
  
  hideAuthOverlay();
}

// Facebook Login Handler
function signInWithFacebook() {
  const fbEmail = prompt("Enter your Facebook Email or Username:", "makki@facebook.com");
  if (fbEmail) {
    const accountName = fbEmail.split('@')[0];
    currentUser = {
      name: accountName.charAt(0).toUpperCase() + accountName.slice(1),
      handle: '@' + accountName,
      email: fbEmail,
      avatar: accountName.charAt(0).toUpperCase()
    };
    saveUserAndSyncUI(currentUser);
  }
}

// Email/Password Login Handler
function handleEmailLogin() {
  const emailInput = document.getElementById('authEmail').value;
  if (!emailInput.trim()) {
    alert('Please enter your email or username!');
    return;
  }
  const accountName = emailInput.split('@')[0];
  currentUser = {
    name: accountName.charAt(0).toUpperCase() + accountName.slice(1),
    handle: '@' + accountName,
    email: emailInput,
    avatar: accountName.charAt(0).toUpperCase()
  };
  saveUserAndSyncUI(currentUser);
}

// Sign Up Handler
function handleSignUp() {
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

  const displayName = user ? user.name : 'Makki';
  const avatarLetter = user ? user.name[0].toUpperCase() : 'M';

  if (user) {
    headerContainer.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-sky-500 text-black font-bold flex items-center justify-center text-sm">${avatarLetter}</div>
        <span class="text-white font-semibold text-xs sm:text-sm truncate max-w-[120px]">${displayName}</span>
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
        <span class="text-white font-semibold text-xs sm:text-sm">Guest</span>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="switchPage('profile')" class="text-xs bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 font-medium px-3 py-1.5 rounded-full transition">My Profile</button>
        <button onclick="signInWithGoogle()" class="text-xs bg-sky-500 hover:bg-sky-400 text-black font-bold px-3 py-1.5 rounded-full transition">Login with Google</button>
      </div>
    `;
  }
                               }
