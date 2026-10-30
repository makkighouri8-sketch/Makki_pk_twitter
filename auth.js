/* PkTweed - Supabase Production Auth Engine (auth.js) - v15.0 */

// 1. Supabase Initialization (Apni project URL aur anon Key yahan replace karein)
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let currentUser = null;
let currentProvider = 'google';

document.addEventListener("DOMContentLoaded", async () => {
  await checkSession();
});

// Real Session Check & Event Listener
async function checkSession() {
  if (!supabase) {
    checkLocalAuth();
    return;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    syncUserData(session.user);
    hideAuthOverlay();
  } else {
    updateHeaderUI(null);
  }

  // Real-time authentication listener
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      syncUserData(session.user);
      hideAuthOverlay();
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      localStorage.removeItem('pktweed_current_user');
      updateHeaderUI(null);
      showAuthOverlay();
    }
  });
}

// Handle Google, Facebook, and TikTok Button Actions
async function openAccountPicker(provider) {
  currentProvider = provider;
  if (!supabase) {
    // Fallback modal agar Supabase credentials missing hon
    document.getElementById('accountPickerModal')?.classList.remove('hidden');
    return;
  }

  if (provider === 'google') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) alert("Google Login Error: " + error.message);
  } else if (provider === 'facebook') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: window.location.origin }
    });
    if (error) alert("Facebook Login Error: " + error.message);
  } else if (provider === 'tiktok') {
    document.getElementById('customAccountModal')?.classList.remove('hidden');
  }
}

function closeAccountPicker() {
  document.getElementById('accountPickerModal')?.classList.add('hidden');
}

// Real Email & Password Login
async function handleEmailLogin() {
  const emailInput = document.getElementById('authEmail')?.value.trim();
  const passwordInput = document.getElementById('authPassword')?.value;

  if (!emailInput || !passwordInput) {
    alert('Please enter both Email and Password!');
    return;
  }

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailInput,
      password: passwordInput,
    });

    if (error) {
      alert("Login Error: " + error.message);
    } else {
      syncUserData(data.user);
      hideAuthOverlay();
    }
  } else {
    const namePart = emailInput.split('@')[0];
    currentUser = {
      name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
      handle: '@' + namePart,
      email: emailInput,
      avatar: namePart.charAt(0).toUpperCase()
    };
    saveUserAndSyncUI(currentUser);
  }
}

// Real Sign Up
async function handleSignUp() {
  const emailInput = document.getElementById('authEmail')?.value.trim();
  const passwordInput = document.getElementById('authPassword')?.value;

  if (!emailInput || !passwordInput) {
    alert('Please enter Email and Password to Sign Up!');
    return;
  }

  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: emailInput,
      password: passwordInput,
    });

    if (error) {
      alert("Sign Up Error: " + error.message);
    } else {
      alert("Verification link sent to your email! Check your inbox.");
    }
  } else {
    handleEmailLogin();
  }
}

// Real Password Reset Link Request
async function handleForgotPassword() {
  const emailInput = prompt("Enter your Gmail for Password Reset link:");
  if (!emailInput || !emailInput.includes('@')) {
    alert("Valid Gmail address required!");
    return;
  }

  if (supabase) {
    const { error } = await supabase.auth.resetPasswordForEmail(emailInput, {
      redirectTo: window.location.origin,
    });

    if (error) {
      alert("Password Reset Error: " + error.message);
    } else {
      alert(`Password reset link sent to ${emailInput}! Check your Gmail inbox.`);
    }
  } else {
    alert(`Reset link simulated for ${emailInput}!`);
  }
}

// Data Synchronizer
function syncUserData(user) {
  const emailPart = user.email ? user.email.split('@')[0] : 'user';
  currentUser = {
    id: user.id,
    name: user.user_metadata?.full_name || emailPart.charAt(0).toUpperCase() + emailPart.slice(1),
    handle: '@' + emailPart,
    email: user.email,
    avatar: user.user_metadata?.avatar_url || emailPart.charAt(0).toUpperCase()
  };

  saveUserAndSyncUI(currentUser);
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

// Logout Execution
async function logoutUser() {
  if (supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem('pktweed_current_user');
  currentUser = null;
  updateHeaderUI(null);
  showAuthOverlay();
}

function showAuthOverlay() {
  const authOverlay = document.getElementById('authOverlay');
  if (authOverlay) {
    authOverlay.style.display = 'flex';
    authOverlay.style.opacity = '1';
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
  
