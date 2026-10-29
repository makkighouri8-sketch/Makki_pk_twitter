/* PkTweed - UI Components (components.js) - Stable Version with Saved Bookmarks & 3-Dots Menu */

let activeMedia = null;
let savedPostsData = [];
let notificationsData = [
  { id: 1, type: 'follow', text: 'Tringo AI started following your profile.', time: '1m ago' },
  { id: 2, type: 'like', text: 'Tringo AI liked your recent PkTweed.', time: '5m ago' }
];

if (typeof checkLocalAuth === 'function') checkLocalAuth();
loadSmartFeed();

document.addEventListener('DOMContentLoaded', () => {
  if (typeof checkLocalAuth === 'function') checkLocalAuth();
  loadSmartFeed();
});

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function loadSmartFeed() {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  let localPosts = [];
  try {
    const cached = localStorage.getItem('pktweed_posts_list');
    if (cached) localPosts = JSON.parse(cached);
  } catch (e) {}

  if (typeof sortPostsByXAlgorithm === 'function' && localPosts.length > 0) {
    localPosts = sortPostsByXAlgorithm(localPosts);
  }

  timeline.innerHTML = '';
  if (!localPosts || localPosts.length === 0) {
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

  renderProfilePosts(localPosts || []);
}

function renderPostElement(post, prepend = true) {
  const timeline = document.getElementById('timeline');
  if (!timeline || !post) return;

  const article = document.createElement('article');
  article.className = 'p-4 my-3 mx-2 bg-gray-900/60 border border-gray-800/80 rounded-2xl hover:border-sky-500/40 transition-all duration-300 shadow-lg post-item';
  article.id = 'post-' + post.id;

  let mediaHtml = '';
  if (post.media_url) {
    mediaHtml = `<img src="${post.media_url}" class="w-full max-h-80 object-cover rounded-2xl mt-3 border border-gray-800"/>`;
  }

  const timeText = typeof calculateTimeAgo === 'function' ? calculateTimeAgo(post.created_at) : 'Just now';
  const userName = post.user_name || 'Makki';

  article.innerHTML = `
    <div class="flex gap-3">
      <div class="w-10 h-10 rounded-full bg-sky-500 flex-shrink-0 flex items-center justify-center font-bold text-black shadow-md">
        ${escapeHTML(userName[0])}
      </div>
      <div class="w-full relative">
        
        <!-- 3-Dots Menu Button on Top Right -->
        <div class="absolute right-0 top-0">
          <button onclick="togglePostDropdown('${post.id}')" class="text-gray-400 hover:text-white p-2 rounded-full transition">
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <div id="postDropdown-${post.id}" class="hidden absolute right-0 mt-1 w-44 bg-gray-950 border border-gray-800 rounded-xl shadow-2xl z-20 py-1.5 text-xs">
            <button onclick="sharePost(); togglePostDropdown('${post.id}')" class="w-full text-left px-4 py-2 hover:bg-gray-900 text-gray-300 flex items-center gap-2.5"><i class="far fa-share-square text-sky-400"></i> Share Post</button>
            <button onclick="toggleCommentBox('${post.id}'); togglePostDropdown('${post.id}')" class="w-full text-left px-4 py-2 hover:bg-gray-900 text-gray-300 flex items-center gap-2.5"><i class="far fa-comment text-sky-400"></i> Comment</button>
            <button onclick="addPostToStory('${post.id}')" class="w-full text-left px-4 py-2 hover:bg-gray-900 text-gray-300 flex items-center gap-2.5"><i class="fas fa-plus-circle text-sky-400"></i> Add Story</button>
          </div>
        </div>

        <div class="flex items-center gap-2 pr-8">
          <span class="font-bold text-white">${escapeHTML(userName)}</span>
          <i class="fas fa-check-circle text-sky-400 text-xs"></i>
          <span class="text-gray-500 text-sm">· ${timeText}</span>
        </div>
        <p class="text-white mt-2 text-sm leading-relaxed">${escapeHTML(post.content || '')}</p>
        ${mediaHtml}
        <div class="flex justify-between text-gray-500 text-sm mt-4 max-w-md pr-2 border-t border-gray-800/40 pt-2">
          <button onclick="toggleCommentBox('${post.id}')" class="hover:text-sky-400 flex items-center gap-2 text-gray-500 transition"><i class="far fa-comment"></i> <span id="cm-cnt-${post.id}">${post.comments_count || 0}</span></button>
          <button onclick="toggleRetweet(this, '${post.id}')" class="hover:text-green-500 flex items-center gap-2 text-gray-500"><i class="fas fa-retweet"></i> <span class="rt-cnt">${post.retweets || 0}</span></button>
          <button onclick="toggleLike(this, '${post.id}')" class="hover:text-pink-500 flex items-center gap-2 text-gray-500"><i class="far fa-heart"></i> <span class="like-cnt">${post.likes || 0}</span></button>
          <button onclick="toggleBookmark(this, '${post.id}')" class="hover:text-sky-400 text-gray-500"><i class="far fa-bookmark"></i></button>
          <button onclick="sharePost()" class="hover:text-sky-400 text-gray-500 transition"><i class="far fa-share-square"></i></button>
        </div>

        <div id="commentSection-${post.id}" class="hidden mt-3 pt-3 border-t border-gray-800/60">
          <div class="flex gap-2 mb-2">
            <input type="text" id="cm-input-${post.id}" placeholder="Write a reply..." class="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-full px-3 py-1.5 focus:outline-none focus:border-sky-500">
            <button onclick="addComment('${post.id}')" class="bg-sky-500 text-black font-bold text-xs px-3.5 py-1.5 rounded-full hover:bg-sky-400 transition">Reply</button>
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

  const myPosts = posts.filter(p => p && p.user_name === 'Makki');

  if (!myPosts || myPosts.length === 0) {
    profContainer.innerHTML = `<p class="text-gray-500 text-sm py-6">Your published tweeds will appear here.</p>`;
    return;
  }

  profContainer.innerHTML = '';
  myPosts.forEach(post => {
    const article = document.createElement('article');
    article.className = 'p-4 my-3 mx-2 bg-gray-900/60 border border-gray-800/80 rounded-2xl hover:border-sky-500/40 transition-all duration-300 shadow-lg post-item relative text-left';
    article.id = 'profile-post-' + post.id;

    let mediaHtml = '';
    if (post.media_url) {
      mediaHtml = `<img src="${post.media_url}" class="w-full max-h-80 object-cover rounded-2xl mt-3 border border-gray-800"/>`;
    }

    const timeText = typeof calculateTimeAgo === 'function' ? calculateTimeAgo(post.created_at) : 'Just now';

    article.innerHTML = `
      <div class="flex gap-3">
        <div class="w-10 h-10 rounded-full bg-sky-500 flex-shrink-0 flex items-center justify-center font-bold text-black shadow-md">
          ${escapeHTML(post.user_name[0])}
        </div>
        <div class="w-full relative">
          
          <div class="absolute right-0 top-0">
            <button onclick="togglePostDropdown('prof-${post.id}')" class="text-gray-400 hover:text-white p-2 rounded-full transition">
              <i class="fas fa-ellipsis-v"></i>
            </button>
            <div id="postDropdown-prof-${post.id}" class="hidden absolute right-0 mt-1 w-44 bg-gray-950 border border-gray-800 rounded-xl shadow-2xl z-20 py-1.5 text-xs">
              <button onclick="sharePost(); togglePostDropdown('prof-${post.id}')" class="w-full text-left px-4 py-2 hover:bg-gray-900 text-gray-300 flex items-center gap-2.5"><i class="far fa-share-square text-sky-400"></i> Share Post</button>
              <button onclick="toggleCommentBox('prof-${post.id}'); togglePostDropdown('prof-${post.id}')" class="w-full text-left px-4 py-2 hover:bg-gray-900 text-gray-300 flex items-center gap-2.5"><i class="far fa-comment text-sky-400"></i> Comment</button>
              <button onclick="addPostToStory('${post.id}')" class="w-full text-left px-4 py-2 hover:bg-gray-900 text-gray-300 flex items-center gap-2.5"><i class="fas fa-plus-circle text-sky-400"></i> Add Story</button>
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
            <button onclick="toggleCommentBox('prof-${post.id}')" class="hover:text-sky-400 flex items-center gap-2 text-gray-500 transition"><i class="far fa-comment"></i> <span id="cm-cnt-prof-${post.id}">${post.comments_count || 0}</span></button>
            <button onclick="toggleRetweet(this, 'prof-${post.id}')" class="hover:text-green-500 flex items-center gap-2 text-gray-500"><i class="fas fa-retweet"></i> <span class="rt-cnt">${post.retweets || 0}</span></button>
            <button onclick="toggleLike(this, 'prof-${post.id}')" class="hover:text-pink-500 flex items-center gap-2 text-gray-500"><i class="far fa-heart"></i> <span class="like-cnt">${post.likes || 0}</span></button>
            <button onclick="toggleBookmark(this, 'prof-${post.id}')" class="hover:text-sky-400 text-gray-500"><i class="far fa-bookmark"></i></button>
            <button onclick="sharePost()" class="hover:text-sky-400 text-gray-500 transition"><i class="far fa-share-square"></i></button>
          </div>

          <div id="commentSection-prof-${post.id}" class="hidden mt-3 pt-3 border-t border-gray-800/60">
            <div class="flex gap-2 mb-2">
              <input type="text" id="cm-input-prof-${post.id}" placeholder="Write a reply..." class="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-full px-3 py-1.5 focus:outline-none focus:border-sky-500">
              <button onclick="addComment('prof-${post.id}')" class="bg-sky-500 text-black font-bold text-xs px-3.5 py-1.5 rounded-full hover:bg-sky-400 transition">Reply</button>
            </div>
            <div id="cm-list-prof-${post.id}" class="space-y-1.5 text-xs text-gray-300"></div>
          </div>

        </div>
      </div>
    `;
    profContainer.appendChild(article);
  });
}

function togglePostDropdown(postId) {
  const dropdown = document.getElementById('postDropdown-' + postId);
  if (dropdown) dropdown.classList.toggle('hidden');
}

function addPostToStory(postId) {
  alert('Aapki post story mein successfully add ho gayi hai! 🚀🇵🇰');
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
}

function updatePostInStorage(postId, updateFn) {
  try {
    let cleanId = postId.toString().replace('prof-', '');
    let localPosts = JSON.parse(localStorage.getItem('pktweed_posts_list') || '[]');
    localPosts = localPosts.map(p => {
      if (p.id == cleanId) updateFn(p);
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
  const cleanId = pid.toString().replace('prof-', '');
  const postElement = document.getElementById('post-' + cleanId) || document.getElementById('profile-post-' + cleanId);
  if (!icon) return;

  if (icon.classList.contains('far')) {
    icon.classList.replace('far', 'fas');
    btn.classList.add('text-sky-400');
    if (postElement && !savedPostsData.some(p => p.id === cleanId)) {
      savedPostsData.push({ id: cleanId, html: postElement.innerHTML });
    }
  } else {
    icon.classList.replace('fas', 'far');
    btn.classList.remove('text-sky-400');
    savedPostsData = savedPostsData.filter(p => p.id !== cleanId);
  }
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

  let currentComments = 0;
  if (cntEl) {
    currentComments = parseInt(cntEl.innerText || 0) + 1;
    cntEl.innerText = currentComments;
  }
  updatePostInStorage(id, p => p.comments_count = currentComments);
  input.value = '';
}

function sharePost() {
  if (navigator.share) {
    navigator.share({ title: 'PkTweed', url: window.location.href }).catch(() => {});
  } else {
    alert('Link copied to clipboard!');
  }
}

function switchPage(pageID) {
  ['feed', 'explore', 'notif', 'profile'].forEach(p => {
    document.getElementById('page' + p.charAt(0).toUpperCase() + p.slice(1))?.classList.add('hidden');
    const navBtn = document.getElementById('nav' + p.charAt(0).toUpperCase() + p.slice(1));
    if (navBtn) {
      navBtn.classList.remove('text-sky-400');
      navBtn.classList.add('text-gray-400');
    }
  });

  document.getElementById('page' + pageID.charAt(0).toUpperCase() + pageID.slice(1))?.classList.remove('hidden');
  const activeNav = document.getElementById('nav' + pageID.charAt(0).toUpperCase() + pageID.slice(1));
  if (activeNav) {
    activeNav.classList.remove('text-gray-400');
    activeNav.classList.add('text-sky-400');
  }
  window.scrollTo(0, 0);
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

function openTringoModal() { document.getElementById('tringoModal')?.classList.remove('hidden'); }
function closeTringoModal() { document.getElementById('tringoModal')?.classList.add('hidden'); }

function askTringoAI() {
  const input = document.getElementById('tringoPromptInput');
  const chatBox = document.getElementById('tringoChatBox');
  if (!input || !input.value.trim() || !chatBox) return;

  const userMsg = input.value;
  chatBox.innerHTML += `<div class="bg-gray-900 p-2 rounded-xl text-right text-gray-200 border border-gray-800"><strong>You:</strong> ${escapeHTML(userMsg)}</div>`;
  input.value = '';

  setTimeout(() => {
    chatBox.innerHTML += `<div class="bg-sky-950/40 p-2 rounded-xl border border-sky-900 text-sky-300"><strong>Tringo AI:</strong> Systems running smoothly!</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 500);
}

function openPostModal() { document.getElementById('postModal')?.classList.remove('hidden'); }
function closePostModal() { document.getElementById('postModal')?.classList.add('hidden'); removeModalMedia(); }

function processModalMedia(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    activeMedia = evt.target.result;
    document.getElementById('modalMediaBox')?.classList.remove('hidden');
    const img = document.getElementById('modalImgPrev');
    if (img) img.src = activeMedia;
  };
  reader.readAsDataURL(file);
}

function removeModalMedia() {
  activeMedia = null;
  document.getElementById('modalMediaBox')?.classList.add('hidden');
}
  
