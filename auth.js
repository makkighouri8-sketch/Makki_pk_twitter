/* PkTweed - Authentication & Session Engine (auth.js) - v1.0 */

let currentUser = null;

// Local Session Auth Check
function checkLocalAuth() {
  const savedUser = localStorage.getItem('pktweed_current_user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateHeaderUI(currentUser);
  } else {
    updateHeaderUI(null);
  }
}

// Simulate Google Login Locally
function signInWithGoogle() {
  currentUser = {
    name: 'Makki',
    handle: '@makki',
    email: 'makki@pktweed.pk',
    avatar: null
  };
  localStorage.setItem('pktweed_current_user', JSON.stringify(currentUser));
  updateHeaderUI(currentUser);
  alert('Successfully logged in as Makki! 🇵🇰');
  window.location.reload();
}

// Logout Function
function logoutUser() {
  localStorage.removeItem('pktweed_current_user');
  currentUser = null;
  updateHeaderUI(null);
  alert('Successfully logged out!');
  window.location.reload();
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

