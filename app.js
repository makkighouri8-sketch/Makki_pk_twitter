/* PkTweed - Ultimate Algorithm Engine (app.js) - v103.0 */

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
  checkLocalAuth();
  loadLocalPosts();
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

// Update Header UI
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

// Smart Time Calculation Algorithm
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

// Load Posts & Sync Profile Posts
function loadLocalPosts() {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  let localPosts = [];
  try {
    const cached = localStorage.getItem('pktweed_posts_list');
    if (cached) localPosts = JSON.parse(cached);
  } catch (e) {}

  if (localPosts.length > 0) {
    timeline.innerHTML = '';
    localPosts.forEach(post => renderPostElement(post, false));
  }
  
  renderProfilePosts(localPosts);
}

function renderPostElement(post, prepend = true) {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  const article = document.createElement('article');
  article.className = 'p-4 my-3 mx-2 bg-gray-900/60 border border-gray-800/80 rounded-2xl hover:border-sky-500/40 transition-all duration-300 shadow-lg post-item';
  article.id = 'post-' + post.id;

  let mediaHtml = '';
  if (post.media_url) {
    mediaHtml = `<img src="${post.media_url}" class="w-full max-h-80 object-cover rounded-2xl mt-3 border border-gray-800"/>`;
  }

  const timeText = calculateTimeAgo(post.created_at);

  article.innerHTML = `
    <div class="flex gap-3">
      <div class="w-10 h-10 rounded-full bg-sky-500 flex-shrink-0 flex items-center justify-center font-bold text-black shadow-md">
        ${escapeHTML(post.user_name[0])}
      </div>
      <div class="w-full">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="font-bold text-white">${escapeHTML(post.user_name)}</span>
            <i class="fas fa-check-circle text-sky-400 text-xs"></i>
            <span class="text-gray-500 text-sm">· ${timeText}</span>
          </div>
        </div>
        <p class="text-white mt-2 text-sm leading-relaxed">${escapeHTML(post.content || '')}</p>
        ${mediaHtml}
        <div class="flex justify-between text-gray-500 text-sm mt-4 max-w-md pr-2 border-t border-gray-800/40 pt-2">
          <button onclick="toggleCommentBox('${post.id}')" class="hover:text-sky-400 flex items-center gap-2 text-gray-500 transition"><i class="far fa-comment"></i> <span id="cm-cnt-${post.id}">0</span></button>
          <button onclick="toggleRetweet(this)" class="hover:text-green-500 flex items-center gap-2 text-gray-500 transition"><i class="fas fa-retweet"></i> <span class="rt-cnt">${post.retweets || 0}</span></button>
          <button onclick="toggleLike(this)" class="hover:text-pink-500 flex items-center gap-2 text-gray-500 transition"><i class="far fa-heart"></i> <span class="like-cnt">${post.likes || 0}</span></button>
          <button onclick="toggleBookmark(this, '${post.id}')" class="hover:text-sky-400 text-gray-500 transition"><i class="far fa-bookmark"></i></button>
          <button onclick="sharePost()" class="hover:text-sky-400 text-gray-500 transition"><i class="far fa-share-square"></i></button>
        </div>

        <div id="commentSection-${post.id}" class="hidden mt-3 pt-3 border-t border-gray-800/60">
          <div class="flex gap-2 mb-2">
            <input type="text" id="cm-input-${post.id}" placeholder="Write a reply..." class="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-full px-3 py-1.5 focus:outline-none focus:border-sky-500">
            <button onclick="addComment('${post.id}')" class="bg-sky-500 text-black font-bold text-xs px-3 py-1.5 rounded-full hover:bg-sky-400 transition">Reply</button>
          </div>
          <div id="cm-list-${post.id}" class="space-y-1.5 text-xs text-gray-300"></div>
        </div>

      </div>
    </div>
  `;

  if (prepend) {
    timeline.insertBefore(article, timeline.firstChild);
  } else {
    timeline.appendChild(article);
  }
}

// Profile Posts Automatic Sync
function renderProfilePosts(posts) {
  const profContainer = document.getElementById('profPostsContainer');
  if (!profContainer) return;

  if (!posts || posts.length === 0) {
    profContainer.innerHTML = `<p class="text-gray-500 text-sm py-6">Your published tweeds will appear here.</p>`;
    return;
  }

  profContainer.innerHTML = '';
  posts.forEach(post => {
    const div = document.createElement('div');
    div.className = 'p-4 border-b border-gray-800 text-left bg-gray-900/30';
    div.innerHTML = `
      <div class="flex items-center gap-2 mb-1">
        <span class="font-bold text-white text-xs">${escapeHTML(post.user_name)}</span>
        <span class="text-gray-500 text-xs">· ${calculateTimeAgo(post.created_at)}</span>
      </div>
      <p class="text-white text-sm">${escapeHTML(post.content)}</p>
    `;
    profContainer.appendChild(div);
  });
}

// Create New Post with Algorithm Triggers & Notifications
function createNewModalPost() {
  const inputEl = document.getElementById('modalPostInput');
  const textVal = inputEl ? inputEl.value : '';
  if (!textVal.trim() && !activeMedia) return;

  const newPostData = {
    id: 'post_' + Date.now(),
    user_name: 'Makki',
    user_handle: '@makki',
    content: textVal,
    media_url: activeMedia || null,
    likes: 0,
    retweets: 0,
    created_at: new Date().toISOString()
  };

  if (inputEl) inputEl.value = '';
  closePostModal();
  switchPage('feed');
  
  renderPostElement(newPostData, true);

  try {
    let localPosts = JSON.parse(localStorage.getItem('pktweed_posts_list') || '[]');
    localPosts.unshift(newPostData);
    localStorage.setItem('pktweed_posts_list', JSON.stringify(localPosts));
    renderProfilePosts(localPosts);
  } catch (e) {}

  // Trigger Automatic Notification for Activity
  notificationsData.unshift({
    id: Date.now(),
    type: 'alert',
    text: 'Your PkTweed was successfully broadcasted to the network! 🚀',
    time: 'Just now'
  });
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
    renderSavedBookmarks(); 
  }
}

function renderNotifications() {
  const container = document.getElementById('pageNotif');
  if (!container) return;

  container.innerHTML = `
    <h2 class="font-extrabold text-lg mb-3 px-2 text-white">Notifications</h2>
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
    let response = "Tringo AI: Algorithm running at peak performance!";
    const lower = userMsg.toLowerCase();
    if (lower.includes('post') || lower.includes('tweet')) {
      response = "Tringo AI: Tap the (+) button below to push a new tweed.";
    }

    const aiDiv = document.createElement('div');
    aiDiv.className = 'bg-sky-950/40 p-2 rounded-xl border border-sky-900 text-sky-300';
    aiDiv.innerHTML = `<strong>Tringo AI:</strong> ${response}`;
    chatBox.appendChild(aiDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 600);
}

function openPostModal() { document.getElementById('postModal')?.classList.remove('hidden'); }
function closePostModal() { document.getElementById('postModal')?.classList.add('hidden'); removeModalMedia(); }

function processModalMedia(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    activeMedia = evt.target.result;
    const box = document.getElementById('modalMediaBox');
    const img = document.getElementById('modalImgPrev');
    if (box) box.classList.remove('hidden');
    if (img) img.src = activeMedia;
  };
  reader.readAsDataURL(file);
}

function removeModalMedia() {
  activeMedia = null;
  document.getElementById('modalMediaBox')?.classList.add('hidden');
}

function toggleLike(btn) {
  const icon = btn.querySelector('i');
  const cnt = btn.querySelector('.like-cnt');
  if (!icon) return;
  let val = cnt ? parseInt(cnt.innerText || 0) : 0;
  if (icon.classList.contains('far')) {
    icon.classList.replace('far', 'fas');
    btn.classList.add('text-pink-500');
    if (cnt) cnt.innerText = val + 1;
    
    notificationsData.unshift({
      id: Date.now(),
      type: 'like',
      text: 'Someone liked your PkTweed! ❤️',
      time: 'Just now'
    });
  } else {
    icon.classList.replace('fas', 'far');
    btn.classList.remove('text-pink-500');
    if (cnt) cnt.innerText = Math.max(0, val - 1);
  }
}

function toggleRetweet(btn) {
  const cnt = btn.querySelector('.rt-cnt');
  let val = cnt ? parseInt(cnt.innerText || 0) : 0;
  if (!btn.classList.contains('text-green-500')) {
    btn.classList.add('text-green-500');
    if (cnt) cnt.innerText = val + 1;
  } else {
    btn.classList.remove('text-green-500');
    if (cnt) cnt.innerText = Math.max(0, val - 1);
  }
}

function toggleBookmark(btn, pid) {
  const icon = btn.querySelector('i');
  const postElement = document.getElementById('post-' + pid);
  if (!icon) return;

  if (icon.classList.contains('far')) {
    icon.classList.replace('far', 'fas');
    btn.classList.add('text-sky-400');
    if (postElement && !savedPostsData.some(p => p.id === pid)) {
      savedPostsData.push({ id: pid, html: postElement.innerHTML });
    }
  } else {
    icon.classList.replace('fas', 'far');
    btn.classList.remove('text-sky-400');
    savedPostsData = savedPostsData.filter(p => p.id !== pid);
  }
}

function renderSavedBookmarks() {
  const container = document.getElementById('bookmarkList');
  if (!container) return;
  if (savedPostsData.length === 0) {
    container.innerHTML = `<p class="text-gray-500 text-center py-4"><i class="far fa-bookmark text-2xl block mb-2 text-sky-400"></i>No saved bookmarks yet.</p>`;
    return;
  }
  container.innerHTML = '';
  savedPostsData.forEach(item => {
    const wrap = document.createElement('div');
    wrap.className = 'bg-gray-900/40 border border-gray-800 rounded-2xl p-3 text-left mb-3';
    wrap.innerHTML = item.html;
    container.appendChild(wrap);
  });
}

function toggleCommentBox(id) {
  document.getElementById('commentSection-' + id)?.classList.toggle('hidden');
}

function addComment(id) {
  const input = document.getElementById('cm-input-' + id);
  const cntEl = document.getElementById('cm-cnt-' + id);
  const list = document.getElementById('cm-list-' + id);
  if (!input || !input.value.trim() || !list) return;

  const div = document.createElement('div');
  div.className = 'bg-gray-900/40 p-2 rounded-xl';
  div.innerHTML = `<strong class="text-sky-400">@makki:</strong> ${escapeHTML(input.value)}`;
  list.appendChild(div);

  if (cntEl) {
    cntEl.innerText = parseInt(cntEl.innerText || 0) + 1;
  }
  input.value = '';

  notificationsData.unshift({
    id: Date.now(),
    type: 'comment',
    text: 'You received a new reply on your tweed! 💬',
    time: 'Just now'
  });
}

function sharePost() {
  if (navigator.share) {
    navigator.share({ title: 'PkTweed', url: window.location.href }).catch(() => {});
  } else {
    alert('Link copied to clipboard!');
  }
          }
  
