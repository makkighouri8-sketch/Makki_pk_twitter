/* PakPulse - Pure Black Header Engine + Google Auth (app.js) - Fixed v23.0 */

// Global Error Handler to Prevent Mobile App Freezing
window.onerror = function(msg, url, line) {
  console.error(`JS Exception Caught: ${msg} at line ${line}`);
  return false;
};

const SUPABASE_URL = 'https://nfiplfastxflhmqblcvj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jbNSW_How-oA0P6UCNx8JA__2qLmBiS';

let currentUser = null;
let activeMedia = null;
let mediaKind = null;
let postCounter = 100;
let followingCount = 320; 
let followersCount = 2500;
let savedPostsData = []; 
let notificationsData = [  
  { id: 1, type: 'follow', text: 'Tringo AI started following your profile.', time: '1m ago' },
  { id: 2, type: 'like', text: 'Tringo AI liked your recent tweet.', time: '5m ago' }
];

document.addEventListener('DOMContentLoaded', () => {
  initGoogleAuth();
  loadPostsFromSupabaseREST();
});

// Helper Function: HTML Escaping
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Safe & Non-Blocking Google Auth Initializer
async function initGoogleAuth() {
  try {
    const token = getSupabaseToken();
    
    // 3 Seconds Timeout taake request latke nahi aur mobile app freeze na ho
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const sessionRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (sessionRes.ok) {
      currentUser = await sessionRes.json();
      updateHeaderUI(currentUser);
    } else {
      updateHeaderUI(null);
    }
  } catch (err) {
    console.warn('Auth check skipped/timed out:', err.message);
    updateHeaderUI(null);
  }
}

// Google Login Trigger Function
function signInWithGoogle() {
  const redirectUrl = encodeURIComponent(`${window.location.origin}`);
  window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${redirectUrl}`;
}

// Logout Function
async function logoutUser() {
  try {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${getSupabaseToken()}`
      }
    });
  } catch (e) {}
  
  localStorage.removeItem('sb-nfiplfastxflhmqblcvj-auth-token');
  window.location.reload();
}

function getSupabaseToken() {
  try {
    const raw = localStorage.getItem(`sb-nfiplfastxflhmqblcvj-auth-token`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.access_token || SUPABASE_ANON_KEY;
    }
  } catch (e) {}
  return SUPABASE_ANON_KEY;
}

// Update Header UI - Pure Black Header with Fallback Avatar
function updateHeaderUI(user) {
  const headerContainer = document.querySelector('header') || document.getElementById('navbarHeader');
  if (!headerContainer) return;

  headerContainer.className = "w-full bg-black border-b border-gray-800/80 px-4 py-3 flex justify-between items-center shadow-md min-h-[50px]";

  if (user) {
    const meta = user.user_metadata || {};
    const avatarUrl = meta.avatar_url || meta.picture;
    const name = meta.full_name || user.email || 'Makki';
    const firstLetter = name.charAt(0).toUpperCase();

    const avatarHtml = avatarUrl 
      ? `<img src="${avatarUrl}" class="w-8 h-8 rounded-full border border-sky-400 object-cover" title="${escapeHTML(name)}"/>`
      : `<div class="w-8 h-8 rounded-full bg-sky-500 text-black font-bold flex items-center justify-center text-sm">${firstLetter}</div>`;

    headerContainer.innerHTML = `
      <div class="flex items-center gap-2">
        ${avatarHtml}
        <span class="text-white font-semibold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">${escapeHTML(name)}</span>
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

// Direct Supabase REST API Call
async function loadPostsFromSupabaseREST() {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  // 1. Show local cached posts immediately
  let localPosts = [];
  try {
    const cached = localStorage.getItem('pk_posts_cache');
    if (cached) localPosts = JSON.parse(cached);
  } catch (e) {}

  if (localPosts.length > 0) {
    timeline.innerHTML = '';
    localPosts.forEach(post => renderPostElement(post));
  }

  // 2. Fetch fresh data via native fetch API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${SUPABASE_URL}/rest/v1/posts?select=*&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${getSupabaseToken()}`
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const posts = await res.json();
      if (posts && posts.length > 0) {
        timeline.innerHTML = '';
        posts.forEach(post => renderPostElement(post));
        localStorage.setItem('pk_posts_cache', JSON.stringify(posts));
      }
    }
  } catch (err) {
    console.warn('REST Fetch skipped/timed out:', err.message);
  }
}

function renderPostElement(post) {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  const article = document.createElement('article');
  article.className = 'p-4 my-3 mx-2 bg-gray-900/60 border border-gray-800/80 rounded-2xl hover:border-sky-500/40 transition-all duration-300 shadow-lg hover:shadow-sky-500/10 post-item';
  article.id = 'post-' + (post.id || postCounter++);

  let mediaHtml = '';
  if (post.media_url) {
    mediaHtml = `<img src="${post.media_url}" class="w-full max-h-80 object-cover rounded-2xl mt-3 border border-gray-800"/>`;
  }

  article.innerHTML = `
    <div class="flex gap-3">
      <div class="w-10 h-10 rounded-full bg-sky-500 flex-shrink-0 flex items-center justify-center font-bold text-black shadow-md">
        ${post.user_name ? escapeHTML(post.user_name[0]) : 'M'}
      </div>
      <div class="w-full">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="font-bold text-white">${escapeHTML(post.user_name || 'Makki')}</span>
            <i class="fas fa-check-circle text-sky-400 text-xs"></i>
            <span class="text-gray-500 text-sm">· ${formatTime(post.created_at)}</span>
          </div>
        </div>
        <p class="text-white mt-2 text-sm leading-relaxed">${escapeHTML(post.content || '')}</p>
        ${mediaHtml}
        <div class="flex justify-between text-gray-500 text-sm mt-4 max-w-md pr-2 border-t border-gray-800/40 pt-2">
          <button onclick="toggleCommentBox('${post.id || 'local'}')" class="hover:text-sky-400 flex items-center gap-2 text-gray-500 transition"><i class="far fa-comment"></i> <span id="cm-cnt-${post.id || 'local'}">0</span></button>
          <button onclick="toggleRetweet(this, '${post.id || 'local'}')" class="hover:text-green-500 flex items-center gap-2 text-gray-500 transition"><i class="fas fa-retweet"></i> <span class="rt-cnt">${post.retweets_count || 0}</span></button>
          <button onclick="toggleLike(this, '${post.id || 'local'}')" id="likeBtn-${post.id || 'local'}" class="hover:text-pink-500 flex items-center gap-2 text-gray-500 transition"><i class="far fa-heart"></i> <span class="like-cnt">${post.likes_count || 0}</span></button>
          <button onclick="toggleBookmark(this, '${post.id || 'local'}')" id="bmBtn-${post.id || 'local'}" class="hover:text-sky-400 text-gray-500 transition"><i class="far fa-bookmark"></i></button>
          <button onclick="sharePost('${post.id || 'local'}')" class="hover:text-sky-400 text-gray-500 transition"><i class="far fa-share-square"></i></button>
        </div>

        <div id="commentSection-${post.id || 'local'}" class="hidden mt-3 pt-3 border-t border-gray-800/60">
          <div class="flex gap-2 mb-2">
            <input type="text" id="cm-input-${post.id || 'local'}" placeholder="Write a reply..." class="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-full px-3 py-1.5 focus:outline-none focus:border-sky-500">
            <button onclick="addComment('${post.id || 'local'}')" class="bg-sky-500 text-black font-bold text-xs px-3 py-1.5 rounded-full hover:bg-sky-400 transition">Reply</button>
          </div>
          <div id="cm-list-${post.id || 'local'}" class="space-y-1.5 text-xs text-gray-300"></div>
        </div>

      </div>
    </div>
  `;

  timeline.insertBefore(article, timeline.firstChild);
}

// Save post to Supabase + Cache Local Storage
async function createNewModalPost() {
  const inputEl = document.getElementById('modalPostInput');
  const textVal = inputEl ? inputEl.value : '';
  if (!textVal.trim() && !activeMedia) return;

  const uName = currentUser?.user_metadata?.full_name || 'Makki';
  const uHandle = currentUser?.email ? `@${currentUser.email.split('@')[0]}` : '@makki';

  const newPostData = {
    user_name: uName,
    user_handle: uHandle,
    content: textVal,
    media_url: activeMedia || null,
    likes_count: 0,
    retweets_count: 0,
    created_at: new Date().toISOString()
  };

  if (inputEl) inputEl.value = '';
  closePostModal();
  switchPage('feed');
  
  // Instant UI Render
  renderPostElement(newPostData);

  // Update Local Storage Cache immediately
  try {
    let localPosts = JSON.parse(localStorage.getItem('pk_posts_cache') || '[]');
    localPosts.unshift(newPostData);
    localStorage.setItem('pk_posts_cache', JSON.stringify(localPosts));
  } catch (e) {}

  // Save permanently to Supabase Cloud
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${getSupabaseToken()}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(newPostData)
    });

    if (res.ok) {
      console.log('Post permanently saved in Supabase!');
      loadPostsFromSupabaseREST();
    }
  } catch (e) {
    console.warn('Network issue during cloud sync:', e);
  }
}

// Foolproof Page Switcher (Fixes Profile & Navigation Freeze)
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
    if (btnPosts) btnPosts.className = 'flex-1 py-3 border-b-2 border-sky-400 text-sky-400';
    if (btnSaved) btnSaved.className = 'flex-1 py-3 text-gray-500 border-b-2 border-transparent hover:text-white';
  } else {
    savedCont.classList.remove('hidden');
    postsCont.classList.add('hidden');
    if (btnSaved) btnSaved.className = 'flex-1 py-3 border-b-2 border-sky-400 text-sky-400';
    if (btnPosts) btnPosts.className = 'flex-1 py-3 text-gray-500 border-b-2 border-transparent hover:text-white';
    renderSavedBookmarks(); 
  }
}

function openTringoModal() { 
  const el = document.getElementById('tringoModal');
  if (el) el.classList.remove('hidden'); 
}

function closeTringoModal() { 
  const el = document.getElementById('tringoModal');
  if (el) el.classList.add('hidden'); 
}

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
    let response = "Tringo AI: Request processed successfully!";
    const lower = userMsg.toLowerCase();
    if (lower.includes('post') || lower.includes('tweet')) {
      response = "Tringo AI: Tap the floating (+) button at bottom-right to create posts.";
    } else if (lower.includes('hi') || lower.includes('hello')) {
      response = "Tringo AI: Hello Makki! Systems running smoothly.";
    }

    const aiDiv = document.createElement('div');
    aiDiv.className = 'bg-sky-950/40 p-2 rounded-xl border border-sky-900 text-sky-300';
    aiDiv.innerHTML = `<strong>Tringo AI:</strong> ${response}`;
    chatBox.appendChild(aiDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 600);
}

function openPostModal() { 
  const el = document.getElementById('postModal');
  if (el) el.classList.remove('hidden'); 
}

function closePostModal() { 
  const el = document.getElementById('postModal');
  if (el) el.classList.add('hidden'); 
  removeModalMedia(); 
}

function processModalMedia(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    activeMedia = evt.target.result;
    const box = document.getElementById('modalMediaBox');
    const img = document.getElementById('modalImgPrev');
    const vid = document.getElementById('modalVidPrev');
    if (box) box.classList.remove('hidden');

    if (file.type.startsWith('image/')) {
      mediaKind = 'img'; 
      if (img) { img.src = activeMedia; img.classList.remove('hidden'); }
      if (vid) vid.classList.add('hidden');
    } else if (file.type.startsWith('video/')) {
      mediaKind = 'vid'; 
      if (vid) { vid.src = activeMedia; vid.classList.add('hidden'); }
      if (img) img.classList.add('hidden');
    }
  };
  reader.readAsDataURL(file);
}

function removeModalMedia() {
  activeMedia = null; mediaKind = null;
  const box = document.getElementById('modalMediaBox');
  if (box) box.classList.add('hidden');
  const img = document.getElementById('modalImgPrev');
  if (img) img.src = '';
  const vid = document.getElementById('modalVidPrev');
  if (vid) vid.src = '';
}

function toggleFollow(btn) {
  const followingEl = document.getElementById('profileFollowingCount');
  if (btn.innerText === 'Follow') {
    btn.innerText = 'Following';
    btn.className = 'text-xs border border-gray-600 text-gray-300 font-bold px-3 py-1 rounded-full hover:bg-gray-800 transition';
    followingCount++; 
  } else {
    btn.innerText = 'Follow';
    btn.className = 'text-xs bg-sky-500 text-black font-bold px-4 py-1.5 rounded-full transition hover:bg-sky-400';
    followingCount--; 
  }
  if (followingEl) followingEl.innerText = followingCount;
}

// Robust Like Toggle (Handles Counter & Color Sync)
function toggleLike(btn, pid) {
  const icon = btn.querySelector('i');
  const cnt = btn.querySelector('.like-cnt');
  if (!icon) return;
  
  let val = cnt ? parseInt(cnt.innerText || 0) : 15;

  if (icon.classList.contains('far')) {
    icon.classList.replace('far', 'fas');
    btn.classList.add('text-pink-500');
    if (cnt) cnt.innerText = val + 1;
  } else {
    icon.classList.replace('fas', 'far');
    btn.classList.remove('text-pink-500');
    if (cnt) cnt.innerText = Math.max(0, val - 1);
  }
}

// Robust Retweet Toggle
function toggleRetweet(btn, pid) {
  const cnt = btn.querySelector('.rt-cnt');
  let val = cnt ? parseInt(cnt.innerText || 0) : 2;

  if (!btn.classList.contains('text-green-500')) {
    btn.classList.add('text-green-500');
    if (cnt) cnt.innerText = val + 1;
  } else {
    btn.classList.remove('text-green-500');
    if (cnt) cnt.innerText = Math.max(0, val - 1);
  }
}

// Robust Bookmark Toggle
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
  const section = document.getElementById('commentSection-' + id);
  if (section) section.classList.toggle('hidden');
}

function addComment(id) {
  const input = document.getElementById('cm-input-' + id);
  if (!input || !input.value.trim()) return;

  const list = document.getElementById('cm-list-' + id);
  const cntEl = document.getElementById('cm-cnt-' + id);
  const section = document.getElementById('commentSection-' + id);

  const div = document.createElement('div');
  div.className = 'bg-gray-900/40 p-2 rounded-xl';
  div.innerHTML = `<strong class="text-sky-400">${currentUser?.email ? '@' + escapeHTML(currentUser.email.split('@')[0]) : '@makki'}:</strong> ${escapeHTML(input.value)}`;

  if (list) list.appendChild(div);
  if (cntEl) cntEl.i
