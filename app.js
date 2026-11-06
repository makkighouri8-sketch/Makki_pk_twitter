/* PkTweed - X (Twitter) Style Algorithm & Smooth Transitions Engine (app.js) - Fixed Version */

window.onerror = function(msg, url, line) {
  console.error(`JS Exception Caught: ${msg} at line ${line}`);
  return false;
};

let currentUser = null;
let activeMedia = null;
let followingCount = 320; 
let followersCount = 2500;
let savedPostsData = []; 
let notificationsData = [  
  { id: 1, type: 'follow', text: 'Tringo AI started following your profile.', time: '1m ago' },
  { id: 2, type: 'like', text: 'Tringo AI liked your recent PkTweed.', time: '5m ago' }
];

document.addEventListener('DOMContentLoaded', () => {
  if (typeof checkLocalAuth === 'function') checkLocalAuth();
  if (typeof loadSmartFeed === 'function') loadSmartFeed();
  checkFollowerMilestone();
});

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function calculateTimeAgo(timestamp) {
  if (!timestamp) return 'Just now';
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + 'm ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  return days + 'd ago';
}

function triggerDirectCamera() {
  const camInput = document.getElementById('directCameraInput');
  if (camInput) {
    camInput.click();
  } else if (typeof openPostModal === 'function') {
    openPostModal();
  }
}

function handleDirectCameraCapture(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const mediaUrl = e.target.result;
    const newPostData = {
      id: 'post_' + Date.now(),
      user_name: currentUser ? currentUser.name : 'Makki',
      user_handle: currentUser ? currentUser.handle : '@makki',
      content: 'Captured live via PkTweed In-App Camera 📸🇵🇰',
      media_url: mediaUrl,
      likes: 0,
      retweets: 0,
      comments_count: 0,
      created_at: new Date().toISOString()
    };
    try {
      let localPosts = JSON.parse(localStorage.getItem('pktweed_posts_list') || '[]');
      localPosts.unshift(newPostData);
      localStorage.setItem('pktweed_posts_list', JSON.stringify(localPosts));
      if (typeof loadSmartFeed === 'function') loadSmartFeed();
      alert('📸 Camera capture successfully published to your feed!');
    } catch (err) {}
  };
  reader.readAsDataURL(file);
}

function switchPage(pageID) {
  try {
    ['feed', 'explore', 'notif', 'profile'].forEach(p => {
      const pageEl = document.getElementById('page' + p.charAt(0).toUpperCase() + p.slice(1));
      if (pageEl) pageEl.classList.add('hidden');
      
      const navBtn = document.getElementById('nav' + p.charAt(0).toUpperCase() + p.slice(1));
      if (navBtn) {
        navBtn.classList.remove('text-sky-400');
        navBtn.classList.add('text-gray-400');
      }
    });

    const targetPage = document.getElementById('page' + pageID.charAt(0).toUpperCase() + pageID.slice(1));
    if (targetPage) targetPage.classList.remove('hidden');

    const activeNav = document.getElementById('nav' + pageID.charAt(0).toUpperCase() + pageID.slice(1));
    if (activeNav) {
      activeNav.classList.remove('text-gray-400');
      activeNav.classList.add('text-sky-400');
    }

    if (pageID === 'notif') renderNotifications();
    window.scrollTo(0, 0);
  } catch (e) {
    console.error("Navigation error:", e);
  }
}

function switchProfileTab(tab) {
  const postsCont = document.getElementById('profPostsContainer');
  const savedCont = document.getElementById('profSavedContainer');
  const btnPosts = document.getElementById('pTabPosts');
  const btnSaved = document.getElementById('pTabSaved');

  if (!postsCont || !savedCont) return;

  if (tab === 'myPosts') {
    postsCont.classList.remove('hidden');
    savedCont.classList.add('hidden');
    if (btnPosts) btnPosts.className = 'flex-1 py-3 border-b-2 border-sky-400 text-sky-400 font-bold';
    if (btnSaved) btnSaved.className = 'flex-1 py-3 text-gray-500 border-b-2 border-transparent hover:text-white';
  } else {
    savedCont.classList.remove('hidden');
    postsCont.classList.add('hidden');
    if (btnSaved) btnSaved.className = 'flex-1 py-3 border-b-2 border-sky-400 text-sky-400 font-bold';
    if (btnPosts) btnPosts.className = 'flex-1 py-3 text-gray-500 border-b-2 border-transparent hover:text-white';
    if (typeof renderSavedBookmarks === 'function') renderSavedBookmarks(); 
  }
}

function renderNotifications() {
  const container = document.getElementById('pageNotif');
  if (!container) return;

  container.innerHTML = `
    <h2 class="font-extrabold text-lg mb-3 px-2 text-white">Notifications & Tringo Alerts</h2>
    <div class="space-y-2">
      ${notificationsData.map(n => `
        <div class="bg-gray-900/60 border border-gray-800 p-3.5 rounded-xl flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
            <i class="fas fa-bell text-xs"></i>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-200">${escapeHTML(n.text)}</p>
            <span class="text-xs text-gray-500">${escapeHTML(n.time)}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function checkFollowerMilestone() {
  if (typeof evaluateCreatorMilestone === 'function') {
    const result = evaluateCreatorMilestone(followersCount);
    const tickEl = document.getElementById('profileGreenTick');
    if (result.isVerified && tickEl) {
      tickEl.classList.remove('hidden');
    }
  }
}

function openWalletModal() { document.getElementById('walletModal')?.classList.remove('hidden'); }
function closeWalletModal() { document.getElementById('walletModal')?.classList.add('hidden'); }

function openTringoModal() { document.getElementById('tringoModal')?.classList.remove('hidden'); }
function closeTringoModal() { document.getElementById('tringoModal')?.classList.add('hidden'); }

function askTringoAI() {
  const input = document.getElementById('tringoPromptInput');
  const chatBox = document.getElementById('tringoChatBox');
  if (!input || !input.value.trim() || !chatBox) return;

  const userMsg = input.value;
  const uDiv = document.createElement('div');
  uDiv.className = 'bg-gray-900 p-2 rounded-xl text-right text-gray-200 border border-gray-800';
  uDiv.innerHTML = `<strong>You:</strong> ${escapeHTML(userMsg)}`;
  chatBox.appendChild(uDiv);
  input.value = '';

  setTimeout(() => {
    let response = "Tringo AI: X-Style Algorithm, monetization wallets, and smooth transitions are fully active! 🚀🇵🇰";
    const aDiv = document.createElement('div');
    aDiv.className = 'bg-sky-950/40 p-2 rounded-xl border border-sky-900 text-sky-300';
    aDiv.innerHTML = `<strong>Tringo AI:</strong> ${escapeHTML(response)}`;
    chatBox.appendChild(aDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 500);
        }
          
