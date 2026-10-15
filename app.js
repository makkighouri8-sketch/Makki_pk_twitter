/* PK Twitter Pro - Auto-hide Comments Engine (app.js) */

let activeMedia = null;
let mediaKind = null;
let postCounter = 2;
let followingCount = 320; 
let followersCount = 2500;
let savedPostsData = []; 
let notificationsData = [  
  { id: 1, type: 'follow', text: 'Tringo AI started following your profile.', time: '1m ago' },
  { id: 2, type: 'like', text: 'Tringo AI liked your recent tweet.', time: '5m ago' }
];

// Navigation
function switchPage(pageID) {
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

  if (pageID === 'notif') {
    renderNotifications();
  }

  window.scrollTo(0, 0);
}

// Profile Tabs
function switchProfileTab(tab) {
  const postsCont = document.getElementById('profPostsContainer');
  const savedCont = document.getElementById('profSavedContainer');
  const btnPosts = document.getElementById('pTabPosts');
  const btnSaved = document.getElementById('pTabSaved');

  if (tab === 'myPosts') {
    postsCont.classList.remove('hidden');
    savedCont.classList.add('hidden');
    btnPosts.className = 'flex-1 py-3 border-b-2 border-sky-400 text-sky-400';
    btnSaved.className = 'flex-1 py-3 text-gray-500 border-b-2 border-transparent hover:text-white';
  } else {
    savedCont.classList.remove('hidden');
    postsCont.classList.add('hidden');
    btnSaved.className = 'flex-1 py-3 border-b-2 border-sky-400 text-sky-400';
    btnPosts.className = 'flex-1 py-3 text-gray-500 border-b-2 border-transparent hover:text-white';
    renderSavedBookmarks(); 
  }
}

// Tringo AI Dashboard Modal Handlers
function openTringoModal() {
  document.getElementById('tringoModal').classList.remove('hidden');
}

function closeTringoModal() {
  document.getElementById('tringoModal').classList.add('hidden');
}

function askTringoAI() {
  const input = document.getElementById('tringoPromptInput');
  const chatBox = document.getElementById('tringoChatBox');
  if (!input.value.trim()) return;

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
  }, 700);
}

// Post Modal Handlers
function openPostModal() { document.getElementById('postModal').classList.remove('hidden'); }
function closePostModal() { document.getElementById('postModal').classList.add('hidden'); removeModalMedia(); }

function processModalMedia(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    activeMedia = evt.target.result;
    const box = document.getElementById('modalMediaBox');
    const img = document.getElementById('modalImgPrev');
    const vid = document.getElementById('modalVidPrev');
    box.classList.remove('hidden');

    if (file.type.startsWith('image/')) {
      mediaKind = 'img'; img.src = activeMedia; img.classList.remove('hidden'); vid.classList.add('hidden');
    } else if (file.type.startsWith('video/')) {
      mediaKind = 'vid'; vid.src = activeMedia; vid.classList.add('hidden'); img.classList.add('hidden');
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

// Create New Post Engine
function createNewModalPost() {
  const textVal = document.getElementById('modalPostInput').value;
  if (!textVal.trim() && !activeMedia) return;

  const pid = postCounter++;
  const timeline = document.getElementById('timeline');
  const article = document.createElement('article');
  article.className = 'p-4 hover:bg-gray-950/40 transition post-item';
  article.id = 'post-' + pid;

  let mediaHtml = '';
  if (activeMedia) {
    if (mediaKind === 'img') {
      mediaHtml = `<img src="${activeMedia}" class="w-full max-h-80 object-cover rounded-2xl mt-3 border border-gray-800"/>`;
    } else if (mediaKind === 'vid') {
      mediaHtml = `<video src="${activeMedia}" controls class="w-full max-h-80 rounded-2xl mt-3 border border-gray-800"></video>`;
    }
  }

  article.innerHTML = `
    <div class="flex gap-3">
      <div class="w-10 h-10 rounded-full bg-sky-500 flex-shrink-0 flex items-center justify-center font-bold text-black">M</div>
      <div class="w-full">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="font-bold text-white">Makki</span>
            <i class="fas fa-check-circle text-sky-400 text-xs"></i>
            <span class="text-gray-500 text-sm">· Just now</span>
          </div>
        </div>
        <p class="text-white mt-1 text-sm leading-relaxed">${escapeHTML(textVal)}</p>
        ${mediaHtml}
        <div class="flex justify-between text-gray-500 text-sm mt-3 max-w-md pr-4">
          <button onclick="toggleCommentBox('${pid}')" class="hover:text-sky-400 flex items-center gap-2 text-gray-500"><i class="far fa-comment"></i> <span id="cm-cnt-${pid}">0</span></button>
          <button onclick="toggleRetweet(this)" class="hover:text-green-500 flex items-center gap-2 text-gray-500"><i class="fas fa-retweet"></i> <span class="rt-cnt">0</span></button>
          <button onclick="toggleLike(this, '${pid}')" id="likeBtn-${pid}" class="hover:text-pink-500 flex items-center gap-2 text-gray-500"><i class="far fa-heart"></i> <span class="like-cnt">0</span></button>
          <button onclick="toggleBookmark(this, '${pid}')" id="bmBtn-${pid}" class="hover:text-sky-400 text-gray-500"><i class="far fa-bookmark"></i></button>
          <button onclick="sharePost('${pid}')" class="hover:text-sky-400 text-gray-500"><i class="far fa-share-square"></i></button>
        </div>

        <div id="commentSection-${pid}" class="hidden mt-3 pt-3 border-t border-gray-800/60">
          <div class="flex gap-2 mb-2">
            <input type="text" id="cm-input-${pid}" placeholder="Write a reply..." class="w-full bg-gray-900 border border-gray-800 text-xs text-white rounded-full px-3 py-1.5 focus:outline-none focus:border-sky-500">
            <button onclick="addComment('${pid}')" class="bg-sky-500 text-black font-bold text-xs px-3 py-1.5 rounded-full">Reply</button>
          </div>
          <div id="cm-list-${pid}" class="space-y-1.5 text-xs text-gray-300"></div>
        </div>

      </div>
    </div>
  `;

  timeline.prepend(article);
  document.getElementById('modalPostInput').value = '';
  closePostModal();
  switchPage('feed');

  setTimeout(() => {
    triggerTringoAIResponse(pid, textVal);
  }, 1200);
}

function triggerTringoAIResponse(postId, userText) {
  const list = document.getElementById('cm-list-' + postId);
  const cntEl = document.getElementById('cm-cnt-' + postId);
  const followersEl = document.getElementById('profileFollowersCount');

  if (list && cntEl) {
    let aiReply = "Tringo AI: Wah Makki bhai, zabardast post! ⚡🤖";
    const lower = userText.toLowerCase();
    
    if (lower.includes('pakistan') || lower.includes('multan')) {
      aiReply = "Tringo AI: Multan Tech ecosystem represents! 🇵🇰🚀";
    }

    const aiDiv = document.createElement('div');
    aiDiv.className = 'bg-sky-950/40 border border-sky-800/50 p-2.5 rounded-xl mt-1';
    aiDiv.innerHTML = `<strong class="text-sky-400"><span class="mr-1">▲</span> Tringo AI:</strong> ${aiReply}`;
    
    list.appendChild(aiDiv);
    cntEl.innerText = parseInt(cntEl.innerText) + 1;
  }

  followersCount++;
  if (followersEl) followersEl.innerText = followersCount;

  notificationsData.unshift({
    id: Date.now(), type: 'comment', text: 'Tringo AI replied to your post.', time: 'Just now'
  });
}

// TikTok Style Follow Button Toggle
function toggleFollow(btn) {
  const followingEl = document.getElementById('profileFollowingCount');
  
  if (btn.innerText === 'Follow') {
    btn.innerText = 'Following';
    btn.className = 'text-xs border border-gray-600 text-gray-300 font-bold px-3 py-1 rounded-full hover:bg-gray-800 transition';
    followingCount++; 
    notificationsData.unshift({ id: Date.now(), type: 'follow', text: 'You followed a user.', time: 'Just now' });
  } else {
    btn.innerText = 'Follow';
    btn.className = 'text-xs bg-sky-500 text-black font-bold px-4 py-1.5 rounded-full transition hover:bg-sky-400';
    followingCount--; 
  }

  if (followingEl) followingEl.innerText = followingCount;
}

// LIKE & UNLIKE TOGGLE
function toggleLike(btn, pid) {
  const icon = btn.querySelector('i');
  const cnt = btn.querySelector('.like-cnt');
  let val = parseInt(cnt.innerText);

  if (icon.classList.contains('far')) {
    icon.classList.replace('far', 'fas');
    btn.classList.add('text-pink-500');
    cnt.innerText = val + 1;
  } else {
    icon.classList.replace('fas', 'far');
    btn.classList.remove('text-pink-500');
    cnt.innerText = val - 1;
  }
}

// RETWEET TOGGLE
function toggleRetweet(btn) {
  const cnt = btn.querySelector('.rt-cnt');
  let val = parseInt(cnt.innerText);

  if (!btn.classList.contains('text-green-500')) {
    btn.classList.add('text-green-500');
    cnt.innerText = val + 1;
  } else {
    btn.classList.remove('text-green-500');
    cnt.innerText = val - 1;
  }
}

// BOOKMARK TOGGLE
function toggleBookmark(btn, pid) {
  const icon = btn.querySelector('i');
  const postElement = document.getElementById('post-' + pid);
  if (!postElement) return;

  if (icon.classList.contains('far')) {
    icon.classList.replace('far', 'fas');
    btn.classList.add('text-sky-400');
    if (!savedPostsData.some(p => p.id === pid)) {
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
    container.innerHTML = `<i class="far fa-bookmark text-2xl block mb-2 text-sky-400"></i>No saved bookmarks yet.`;
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

// TOGGLE COMMENT SECTION VISIBILITY
function toggleCommentBox(id) {
  const section = document.getElementById('commentSection-' + id);
  if (section) section.classList.toggle('hidden');
}

// ADD COMMENT AND AUTO-HIDE SECTION
function addComment(id) {
  const input = document.getElementById('cm-input-' + id);
  if (!input.value.trim()) return;

  const list = document.getElementById('cm-list-' + id);
  const cntEl = document.getElementById('cm-cnt-' + id);
  const section = document.getElementById('commentSection-' + id);

  const div = document.createElement('div');
  div.className = 'bg-gray-900/40 p-2 rounded-xl';
  div.innerHTML = `<strong class="text-sky-400">@makki:</strong> ${escapeHTML(input.value)}`;

  list.appendChild(div);
  cntEl.innerText = parseInt(cntEl.innerText) + 1;
  input.value = '';

  // Auto-hide comment section after posting so it stays clean like Twitter!
  if (section) {
    section.classList.add('hidden');
  }
}

function renderNotifications() {
  const notifContainer = document.getElementById('pageNotif');
  if (!notifContainer) return;

  let htmlContent = `<h2 class="font-extrabold text-xl mb-4">Activity Notifications</h2><div class="space-y-4 text-sm">`;
  
  notificationsData.forEach(n => {
    let iconClass = 'fas fa-heart text-pink-500 text-lg';
    if (n.type === 'follow') iconClass = 'fas fa-user-plus text-sky-400 text-lg';
    if (n.type === 'comment') iconClass = 'text-sky-400 text-lg font-bold';

    let iconSymbol = n.type === 'comment' ? '▲' : `<i class="${iconClass}"></i>`;

    htmlContent += `
      <div class="flex items-center justify-between border-b border-gray-800 pb-3">
        <div class="flex items-center gap-3">
          <span class="w-5 text-center">${iconSymbol}</span>
          <p class="text-gray-200">${escapeHTML(n.text)}</p>
        </div>
        <span class="text-xs text-gray-500">${n.time}</span>
      </div>
    `;
  });

  htmlContent += `</div>`;
  notifContainer.innerHTML = htmlContent;
}

function sharePost(id) {
  navigator.clipboard.writeText(window.location.href);
  alert('Post link copied to clipboard!');
}

function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }
    
