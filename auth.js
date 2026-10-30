/* PkTweed - Multi-Account Selector & Auth Engine (auth.js) - v6.0 */

let currentUser = null;
let currentProvider = 'google';

// Device Saved Accounts Mock Dataset
let deviceAccounts = {
  google: [
    { name: 'Makki Ghouri', email: 'makkigspirited@gmail.com', avatar: 'M' },
    { name: 'Makki Tech PK', email: 'makkitechdev@gmail.com', avatar: 'T' },
    { name: 'Official PkTweed', email: 'pktweed.official@gmail.com', avatar: 'P' }
  ],
  facebook: [
    { name: 'Makki Ghouri FB', email: 'makki.fb.account@facebook.com', avatar: 'F' }
  ],
  tiktok: [
    { name: 'Makki Official TikTok', email: 'makki_tiktok@creator.pk', avatar: 'K' }
  ]
};

document.addEventListener("DOMContentLoaded", () => {
  checkLocalAuth();
});

// Open Account Picker Modal showing available accounts
function openAccountPicker(provider) {
  currentProvider = provider;
  const modal = document.getElementById('accountPickerModal');
  const title = document.getElementById('pickerTitle');
  const container = document.getElementById('accountsListContainer');
  
  if (title) title.innerText = `Choose a ${provider.toUpperCase()} account`;
  if (container) {
    container.innerHTML = '';
    const accounts = deviceAccounts[provider] || deviceAccounts.google;
    
    accounts.forEach(acc => {
      const item = document.createElement('div');
      item.className = 'flex items-center gap-3 p-3 bg-gray-900 hover:bg-gray-800 rounded-2xl cursor-pointer border border-gray-800/80 transition';
      item.onclick = () => selectAccount(acc);
      item.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-sky-500 text-black font-extrabold flex items-center justify-center text-sm shrink-0 shadow">${acc.avatar}</div>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-white text-xs truncate">${acc.name}</p>
          <p class="text-gray-400 text-[11px] truncate">${acc.email}</p>
        </div>
        <i class="fas fa-chevron-right text-gray-600 text-xs"></i>
      `;
      container.appendChild(item);
    });
  }
  if (modal) modal.classList.remove('hidden');
}

function closeAccountPicker() {
  document.getElementById('accountPickerModal')?.classList.add('hidden');
}

// Select specific account from picker
function selectAccount(acc) {
  currentUser = {
    name: acc.name,
    handle: '@' + acc.email.split('@')[0],
    email: acc.email,
    avatar: acc.avatar
  };
  saveUserAndSyncUI(currentUser);
  closeAccountPicker();
  alert(`🚀 Successfully logged in as ${acc.name} (${acc.email})! 🇵🇰`);
}

// Add new custom account prompt
function addNewAccountPrompt() {
  const newEmail = prompt(`Enter new ${currentProvider.toUpperCase()} email address:`, "newuser@gmail.com");
  if (newEmail && newEmail.includes('@')) {
    const namePart = newEmail.split('@')[0];
    const newAcc = {
      name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
      email: newEmail,
      avatar: namePart.charAt(0).toUpperCase()
    };
    if (deviceAccounts[currentProvider]) {
      deviceAccounts[currentProvider].push(newAcc);
    }
    selectAccount(newAcc);
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

// Save User State and Sync Header & Profile Info
function saveUserAndSyncUI(user) {
  localStorage.setItem('pktweed_current_user', JSON.stringify(user));
  updateHeaderUI(user);
  
  const nameDisp = document.getElementById('profileNameDisplay');
  const handleDisp = document.getElementById('profileHandleDisplay');
  if (nameDisp) nameDisp.innerText = user.name;
  if (handleDisp) handleDisp.innerText = user.handle;
  
  hideAuthOverlay();
}

// Manual Form Login Handler
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

// Logout Engine
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
    setTimeout(() => { authOverlay.style.display = 'none'; }, 400);
  }
}

// Header UI Dynamic Updater
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
        <button onclick="openAccountPicker('google')" class="text-xs bg-sky-500 hover:bg-sky-400 text-black font-bold px-3 py-1.5 rounded-full transition">Login</button>
      </div>
    `;
  }
}
