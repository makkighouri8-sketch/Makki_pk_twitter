/* PK Twitter Pro - Main App Logic (app.js) */

let activeMedia = null;
let mediaKind = null;
let postCounter = 2;

// Tab & Page Navigation System
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
  window.scrollTo(0, 0);
}

// Profile Inner Tabs (Posts vs Saved Bookmarks)
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
  }
}

// Post Modal Controllers (TikTok Plus Button Popup)
function openPostModal() {
  document.getElementById('postModal').classList.remove('hidden');
}

function closePostModal() {
  document.getElementById('postModal').classList.add('hidden');
  removeModalMedia();
}

// Handle Photo & Video Selection
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
      mediaKind = 'img';
      img.src = activeMedia;
      img.classList.remove('hidden');
      vid.classList.add('hidden');
    } else if (file.type.startsWith('video/')) {
      mediaKind = 'vid';
      vid.src = activeMedia;
      vid.classList.remove('hidden');
      img.classList.add('hidden');
    }
  };
  reader.readAsDataURL(file);
}

function removeModalMedia() {
  activeMedia = null;
  mediaKind = null;
  const box = document.getElementById('modalMediaBox');
  if (box) box.classList.add('hidden');
  const img = document.getElementById('modalImgPrev');
  if (img) img.src = '';
  const vid = document.getElementById('modalVidPrev');
  if (vid) vid.src = '';
}

// Publish New Post to Feed
function createNewModalPost() {
  const textVal = document.getElementById('modalPostInput').value;
  if (!textVal.trim() && !activeMedia) return;

  const pid = postCounter++;
  const timeline = document.getElementById('timeline');
  const article = document.createElement('article');
  article.className = 'p-4 hover:bg-gray-950/40 transition';
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
          <button onclick="toggleCommentBox('${pid}')" class="hover:text-sky-400 flex items-center gap-2"><i class="far fa-comment"></i> <span id="cm-cnt-${pid}">0</span></button>
          <button onclick="toggleRetweet(this)" class="hover:text-green-500 flex items-center gap-2"><i class="fas fa-retweet"></i> <span class="rt-cnt">0</span></button>
          <button onclick="toggleLike(this)" class="hover:text-pink-500 flex items-center gap-2"><i class="far fa-heart"></i> <span class="like-cnt">0</span></button>
          <button onclick="toggleBookmark(this)" class="hover:text-sky-400"><i class="far fa-bookmark"></i></button>
          <button onclick="sharePost('${pid}')" class="hover:text-sky-400"><i class="far fa-share-square"></i></button>
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
}

// Like, Retweet & Bookmark Handlers
function toggleLike(btn) {
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

function toggleRetweet(btn) {
  const cnt = btn.querySelector('.rt-cnt');
  let val = parseInt(cnt.innerText);
  if (btn.classList.contains('text-green-500')) {
    btn.classList.remove('text-green-500');
    cnt.innerText = val - 1;
  } else {
    btn.classList.add('text-green-500');
    cnt.innerText = val + 1;
  }
}

function toggleBookmark(btn) {
  const icon = btn.querySelector('i');
  if (icon.classList.contains('far')) {
    icon.classList.replace('far', 'fas');
    btn.classList.add('text-sky-400');
    alert('Saved to Profile Bookmarks!');
  } else {
    icon.classList.replace('fas', 'far');
    btn.classList.remove('text-sky-400');
  }
}

function toggleFollow(btn) {
  if (btn.innerText === 'Follow') {
    btn.innerText = 'Following';
    btn.className = 'text-xs bg-sky-500 text-black font-bold px-3 py-1 rounded-full transition';
  } else {
    btn.innerText = 'Follow';
    btn.className = 'text-xs border border-sky-400 text-sky-400 font-bold px-3 py-1 rounded-full hover:bg-sky-500/10 transition';
  }
}

function toggleCommentBox(id) {
  const section = document.getElementById('commentSection-' + id);
  if (section) section.classList.toggle('hidden');
}

function addComment(id) {
  const input = document.getElementById('cm-input-' + id);
  if (!input.value.trim()) return;

  const list = document.getElementById('cm-list-' + id);
  const cntEl = document.getElementById('cm-cnt-' + id);

  const div = document.createElement('div');
  div.className = 'bg-gray-900/40 p-2 rounded-xl';
  div.innerHTML = `<strong class="text-sky-400">@makki:</strong> ${escapeHTML(input.value)}`;

  list.appendChild(div);
  cntEl.innerText = parseInt(cntEl.innerText) + 1;
  input.value = '';
}

function sharePost(id) {
  navigator.clipboard.writeText(window.location.href);
  alert('Post link copied to clipboard!');
}
  <script src="app.js"></script>
</body>
function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
