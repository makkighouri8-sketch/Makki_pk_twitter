/* PkTweed - X (Twitter) Style Algorithm & 1s Smooth Transitions Engine (app.js) - v105.0 */

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
  loadSmartFeed();
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

function signInWithGoogle() {
  currentUser = {
    name: 'Makki',
    handle: '@makki',
    email: 'makki@pktweed.pk',
    avatar: 'M'
  };
  localStorage.setItem('pktweed_current_user', JSON.stringify(currentUser));
  updateHeaderUI(currentUser);
  hideAuthOverlay();
  alert('🚀 Google Auth Successful! Tringo AI & Algorithm monitoring active. 🇵🇰');
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
  alert('Successfully logged out!');
}

function hideAuthOverlay() {
  const authOverlay = document.getElementById('authOverlay');
  if (authOverlay) {
    authOverlay.style.opacity = '0';
    setTimeout(() => {
      authOverlay.style.display = 'none';
    }, 400);
  }
}

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
        <button onclick="openWalletModal()" class="text-xs bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold px-3 py-1.5 rounded-full transition flex items-center gap-1"><i class="fas fa-wallet"></i> Wallet</button>
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

// X-Style Smart Ranking Algorithm
function loadSmartFeed() {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  let localPosts = [];
  try {
    const cached = localStorage.getItem('pktweed_posts_list');
    if (cached) localPosts = JSON.parse(cached);
  } catch (e) {}

  localPosts.sort((a, b) => {
    const scoreA = (a.likes * 2) + (a.retweets * 3) + ((a.comments_count || 0) * 4);
    const scoreB = (b.likes * 2) + (b.retweets * 3) + ((b.comments_count || 0) * 4);
    const timeA = new Date(a.created_at || Date.now()).getTime();
    const timeB = new Date(b.created_at || Date.now()).getTime();
    return (scoreB * 10 + timeB) - (scoreA * 10 + timeA);
  });

  timeline.innerHTML = '';
  if (localPosts.length === 0) {
    renderPostElement({
      id: 'default_1',
      user_name: 'PkTweed Official',
      content: "Welcome to PkTweed! Pakistan's decentralized smart social media network is running live. 🇵🇰✨",
      likes: 15,
      retweets: 2,
      comments_count: 0,
      created_at: new Date().toISOString()
    }, false);
  } else {
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
      <div class="w-full relative">
        <div class="absolute right-0 top-0">
          <button onclick="togglePostDropdown('${post.id}')" class="text-gray-400 hover:text-white p-2 rounded-full transition">
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <div id="postDropdown-${post.id}" class="hidden absolute right-0 mt-1 w-44 bg-gray-950 border border-gray-800 rounded-xl shadow-2xl z-20 py-1.5 text-xs">
            <button onclick="sharePost(); togglePostDropdown('${post.id}')" class="w-full text-left px-4 py-2 hover:bg-gray-900 text-gray-300 flex items-center gap-2.5"><i class="far fa-share-square text-sky-400"></i> Share Post</button>
            <button onclick="toggleCommentBox('${post.id}'); togglePostDropdown('${post.id}')" class="w-full text-left px-4 py-2 hover:bg-gray-900 text-gray-300 flex items-center gap-2.5"><i class="far fa-comment text-sky-400"></i> Comment</button>
          </div>
        </div>

        <div class="flex items-center gap-2 pr-8">
          <span class="font-bold text-white">${escapeHTML(post.user_name)}</span>
          <i class="fas fa-check-circle text-sky-400 text-xs"></i>
          <span class="text-gray-500 text-sm">· ${timeText}</span>
        </div>
        <p class="text-white mt-2 text-sm leading-relaxed">${escapeHTML(post.content || '')}</p>
        ${mediaHtml}
        
        <div class="flex justify-between text-gray-500 text-sm mt-4 max-w-md pr-2 border-t border-gray-800/40 pt-2">
          <button onclick="toggleCommentBox('${post.id}')" class="hover:text-sky-400 flex items-center gap-2 text-gray-500 transition"><i class="far fa-comment"></i> <span id="cm-cnt-${post.id}">${post.comments_count || 0}</span></button>
          <button onclick="toggleRetweet(this, '${post.id}')" style="transition: all 1s ease-in-out;" class="hover:text-green-500 flex items-center gap-2 text-gray-500"><i class="fas fa-retweet"></i> <span class="rt-cnt">${post.retweets || 0}</span></button>
          <button onclick="toggleLike(this, '${post.id}')" style="transition: all 1s ease-in-out;" class="hover:text-pink-500 flex items-center gap-2 text-gray-500"><i class="far fa-heart"></i> <span class="like-cnt">${post.likes || 0}</span></button>
          <button onclick="toggleBookmark(this, '${post.id}')" style="transition: all 1s ease-in-out;" class="hover:text-sky-400 text-gray-500"><i class="far fa-bookmark"></i></button>
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
    comments_count: 0,
    created_at: new Date().toISOString()
  };

  if (inputEl) inputEl.value = '';
  closePostModal();
  switchPage('feed');
  
  try {
    let localPosts = JSON.parse(localStorage.getItem('pktweed_posts_list') || '[]');
    localPosts.unshift(newPostData);
    localStorage.setItem('pktweed_posts_list', JSON.stringify(localPosts));
    loadSmartFeed();
  } catch (e) {}

  notificationsData.unshift({
    id: Date.now(),
    type: 'alert',
    text: 'Your PkTweed was successfully distributed by the algorithm! 🚀',
    time: 'Just now'
  });
}

function updatePostInStorage(postId, updateFn) {
  try {
    let localPosts = JSON.parse(localStorage.getItem('pktweed_posts_list') || '[]');
    localPosts = localPosts.map(p => {
      if (p.id === postId) {
        updateFn(p);
      }
      return p;
    });
    localStorage.setItem('pktweed_posts_list', JSON.stringify(localPosts));
  } catch (e) {}
}

function toggleLike(btn, postId) {
  const icon = btn.querySelector('i');
  const cnt = btn.querySelector('.like-cnt');
  if (!icon) return;
  let val = cnt ? parseInt(cnt.innerText || 0) : 0;
  
  if (icon.classList.contains('far')) {
    icon.classList.replace('far', 'fas');
    btn.classList.add('text-pink-500');
    val += 1;
    if (cnt) cnt.innerText = val;
    updatePostInStorage(postId, p => p.likes = val);

    notificationsData.unshift({
      id: Date.now(),
      type: 'like',
      text: 'Your PkTweed received an engagement boost! ❤️',
      time: 'Just now'
    });
  } else {
    icon.classList.replace('fas', 'far');
    btn.classList.remove('text-pink-500');
    val = Math.max(0, val - 1);
    if (cnt) cnt.innerText = val;
    updatePostInStorage(postId, p => p.likes = val);
  }
}

function toggleRetweet(btn, postId) {
  const cnt = btn.querySelector('.rt-cnt');
  let val = cnt ? parseInt(cnt.innerText || 0) : 0;
  
  if (!btn.classList.contains('text-green-500')) {
    btn.classList.add('text-green-500');
    val += 1;
    if (cnt) cnt.innerText = val;
    updatePostInStorage(postId, p => p.retweets = val);
  } else {
    btn.classList.remove('text-green-500');
    val = Math.max(0, val - 1);
    if (cnt) cnt.innerText = val;
    updatePostInStorage(postId, p => p.retweets = val);
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

function togglePostDropdown(postId) {
  const dropdown = document.getElementById('postDropdown-' + postId);
  if (dropdown) dropdown.classList.toggle('hidden');
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

  let currentComments = 0;
  if (cntEl) {
    currentComments = parseInt(cntEl.innerText || 0) + 1;
    cntEl.innerText = currentComments;
  }
  
  updatePostInStorage(id, p => p.comments_count = currentComments);
  input.value = '';

  notificationsData.unshift({
    id: Date.now(),
    type: 'comment',
    text: 'Someone replied to your PkTweed! 💬',
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

// 10k Followers Milestone & Green Tick Check
function checkFollowerMilestone() {
  if (typeof evaluateCreatorMilestone === 'function') {
    const result = evaluateCreatorMilestone(followersCount);
    const tickEl = document.getElementById('profileGreenTick');
    if (result.isVerified && tickEl) {
      tickEl.classList.remove('hidden');
    }
  }
}

// Wallet Modal Controls
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
    let response 
