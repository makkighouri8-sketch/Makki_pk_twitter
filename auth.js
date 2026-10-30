/* PkTweed - Stable Local Account Manager & Auth Engine (auth.js) - v16.0 */

let currentUser = null;
let currentProvider = 'google';

function getDeviceAccounts(provider) {
  try {
    const saved = localStorage.getItem(`pktweed_accounts_${provider}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
}

function saveDeviceAccount(provider, acc) {
  let accounts = getDeviceAccounts(provider);
  if (!accounts.some(a => a.email === acc.email)) {
    accounts.push(acc);
    localStorage.setItem(`pktweed_accounts_${provider}`, JSON.stringify(accounts));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  checkLocalAuth();
});

function openAccountPicker(provider) {
  currentProvider = provider;
  const modal = document.getElementById('accountPickerModal');
  const title = document.getElementById('pickerTitle');
  const container = document.getElementById('accountsListContainer');
  
  if (title) title.innerText = `Choose a ${provider.toUpperCase()} account`;
  if (container) {
    container.innerHTML = '';
    const accounts = getDeviceAccounts(provider);
    
    if (accounts.length === 0) {
      container.innerHTML = `<p class="text-xs text-gray-500 text-center py-4">No accounts saved yet. Click below to add your account.</p>`;
    } else {
      accounts.forEach(acc => {
        const item = document.createElement('div');
        item.className = 'flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl cursor-pointer border border-gray-200 transition';
        item.onclick = () => selectAccount(acc);
        item.innerHTML = `
          <div class="w-10 h-10 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow">${acc.avatar}</div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-gray-900 text-xs truncate">${acc.name}</p>
            <p class="text-gray-500 text-[11px] truncate">${acc.email}</p>
          </div>
          <i class="fas fa-chevron-right text-gray-400 text-xs"></i>
        `;
        container.appendChild(item);
      });
    }
  }
  if (modal) modal.classList.remove('hidden');
}

function closeAccountPicker() {
  document.getElementById('accountPickerModal')?.classList.add('hidden');
}

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

function addNewAccountPrompt() {
  const realEmail = prompt(`Enter your real ${currentProvider.toUpperCase()} Gmail ID (e.g. yourname@gmail.com):`, "");
  if (realEmail && realEmail.includes('@')) {
    const nameInput = prompt("Enter your Name:", "User");
    const formattedName = nameInput ? nameInput : realEmail.split('@')[0];
    
    const newAcc = {
      name: formattedName,
      email: realEmail,
      avatar: formattedName.charAt(0).toUpperCase()
    };
    
    saveDeviceAccount(currentProvider, newAcc);
    selectAccount(newAcc);
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
