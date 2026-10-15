/* PK Twitter Pro - Debug Enabled Engine (app.js) */

const SUPABASE_URL = 'https://nfiplfastxflhmqblcvj.supabase.co';
const SUPABASE_ANON_KEY = 'Yahan_Apni_Asli_Publishable_Key_Paste_Karein'; // Apni key yahan lagayein

let supabase;
try {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  alert('Supabase Init Error: ' + e.message);
}

let activeMedia = null;
let mediaKind = null;
let followingCount = 320; 
let followersCount = 2500;
let savedPostsData = []; 
let notificationsData = [  
  { id: 1, type: 'follow', text: 'Tringo AI started following your profile.', time: '1m ago' },
  { id: 2, type: 'like', text: 'Tringo AI liked your recent tweet.', time: '5m ago' }
];

document.addEventListener('DOMContentLoaded', () => {
  loadPostsFromSupabase();
});

async function loadPostsFromSupabase() {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return;
    }

    if (posts && posts.length > 0) {
      timeline.innerHTML = '';
      posts.forEach(post => {
        renderPostElement(post);
      });
    }
  } catch (err) {
    console.error('Network or client error:', err.message);
  }
}

function renderPostElement(post) {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  const article = document.createElement('article');
  article.className = 'p-4 my-3 mx-2 bg-gray-900/60 border border-gray-800/80 rounded-2xl hover:border-sky-500/40 transition-all duration-300 shadow-lg hover:shadow-sky-500/10 post-item';
  article.id = 'post-' + post.id;

  let mediaHtml = '';
  if (post.media_url) {
    mediaHtml = `<img src="${post.media_url}" class="w-full max-h-80 object-cover rounded-2xl mt-3 border border-gray-800"/>`;
  }

  article.innerHTML = `
    <div class="flex gap-3">
      <div class="w-10 h-10 rounded-full bg-sky-500 flex-shrink-0 flex items-center justify-center font-bold text-black shadow-md">
        ${post.user_name ? post.user_name[0] : 'M'}
      </div>
      <div class="w-full">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="font-bold text-white">${post.user_name || 'Makki'}</span>
            <i class="fas fa-check-circle text-sky-400 text-xs"></i>
            <span class="text-gray-500 text-sm">· ${formatTime(post.created_at)}</span>
          </div>
        </div>
        <p class="text-white mt-2 text-sm leading-relaxed">${escapeHTML(post.content || '')}</p>
        ${mediaHtml}
        <div class="flex justify-between text-gray-500 text-sm mt-4 max-w-md pr-2 border-t border-gray-800/40 pt-2">
          <button onclick="toggleCommentBox('${post.id}')" class="hover:text-sky-400 flex items-center gap-2 text-gray-500 transition"><i class="far fa-comment"></i> <span id="cm-cnt-${post.id}">0</span></button>
          <button onclick="toggleRetweet(this, '${post.id}')" class="hover:text-green-500 flex items-center gap-2 text-gray-500 transition"><i class="fas fa-retweet"></i> <span class="rt-cnt">${post.retweets_count || 0}</span></button>
          <button onclick="toggleLike(this, '${post.id}')" id="likeBtn-${post.id}" class="hover:text-pink-500 flex items-center gap-2 text-gray-500 transition"><i class="far fa-heart"></i> <span class="like-cnt">${post.likes_count || 0}</span></button>
          <button onclick="toggleBookmark(this, '${post.id}')" id="bmBtn-${post.id}" class="hover:text-sky-400 text-gray-500 transition"><i class="far fa-bookmark"></i></button>
          <button onclick="sharePost('${post.id}')" class="hover:text-sky-400 text-gray-500 transition"><i class="far fa-share-square"></i></button>
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

  timeline.appendChild(article);
}

async function createNewModalPost() {
  const textVal = document.getElementById('modalPostInput').value;
  if (!textVal.trim() && !activeMedia) return;

  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          user_name: 'Makki',
          user_handle: '@makki',
          content: textVal,
          media_url: activeMedia || null,
          likes_count: 0,
          retweets_count: 0
        }
      ])
      .select();

    if (error) {
      alert('Supabase Insert Error: ' + error.message);
      return;
    }

    document.getElementById('modalPostInput').value = '';
    closePostModal();
    switchPage('feed');
    await loadPostsFromSupabase();
  } catch (err) {
    alert('Exception in create post: ' + err.message);
  }
}

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

function openTringoModal() { document.getElementById('tringoModal').classList.remove('hidden'); }
function closeTringoModal() { document.getElementById('tringoModal').classList.add('hidden'); }

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

async function toggleLike(btn, pid) {
  const icon = btn.querySelector('i');
  const cnt = btn.querySelector('.like-cnt');
  let val = parseInt(cnt.innerText);

  const newCount = icon.classList.contains('far') ? val + 1 : val - 1;

  if (icon.classList.contains('far')) {
    icon.classList.replace('far', 'fas');
    btn.classList.add('text-pink-500');
  } else {
    icon.classList.replace('fas', 'far');
    btn.classList.remove('text-pink-500');
  }
  cnt.innerText = newCount;

  try {
    await supabase.from('posts').update({ likes_count: newCount }).eq('id', pid);
  } catch (err) {
    console.error('Error updating likes:', err.message);
  }
}

async function toggleRetweet(btn, pid) {
  const cnt = btn.querySelector('.rt-cnt');
  let val = parseInt(cnt.innerText);

  const newCount = !btn.classList.contains('text-green-500') ? val + 1 : val - 1;

  if (!btn.classList.contains('text-green-500')) {
    btn.classList.add('text-green-500');
  } else {
    btn.classList.remove('text-green-500');
  }
  cnt.innerText = newCount;

  try {
    await supabase.from('posts').update({ retweets_count: newCount }).eq('id', pid);
  } catch (err) {
    console.error('Error updating retweets:', err.message);
  }
}

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

function toggleCommentBox(id) {
  const section = document.getElementById('commentSection-' + id);
  if (section) section.classList.toggle('hidden');
}

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

function formatTime(isoString) {
  if (!isoString) return 'Just now';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
  
