/* PkTweed - UI Components (components.js) - Fixed Version */

let activeMedia = null;
let savedPostsData = [];
let notificationsData = [
  { id: 1, type: 'follow', text: 'Tringo AI started following your profile.', time: '1m ago' },
  { id: 2, type: 'like', text: 'Tringo AI liked your recent PkTweed.', time: '5m ago' }
];

document.addEventListener('DOMContentLoaded', () => {
  if (typeof checkLocalAuth === 'function') checkLocalAuth();
  loadSavedProfileToUI();
  loadSmartFeed();
});

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function loadSavedProfileToUI() {
  const savedName = localStorage.getItem('pktweed_profile_name');
  const savedHandle = localStorage.getItem('pktweed_profile_handle');
  const savedAvatar = localStorage.getItem('pktweed_profile_avatar');
  const savedBio = localStorage.getItem('pktweed_profile_bio');
  const savedFollowers = parseInt(localStorage.getItem('pktweed_followers') || '2500');

  if (savedName) {
    const nameDisp = document.getElementById('profileNameDisplay');
    const headerUserName = document.getElementById('headerUserName');
    if (nameDisp) nameDisp.innerText = savedName;
    if (headerUserName) headerUserName.innerText = savedName;
  }

  if (savedHandle) {
    const handleDisp = document.getElementById('profileHandleDisplay');
    if (handleDisp) handleDisp.innerText = savedHandle;
  }

  if (savedBio) {
    const bioDisp = document.getElementById('profileBioDisplay');
    if (bioDisp) bioDisp.innerText = savedBio;
  }

  if (savedAvatar) {
    const avatarBig = document.getElementById('profileAvatarBig');
    const headerAvatar = document.getElementById('headerUserAvatar');
    if (avatarBig) avatarBig.innerHTML = `<img src="${savedAvatar}" class="w-full h-full rounded-full object-cover">`;
    if (headerAvatar) headerAvatar.innerHTML = `<img src="${savedAvatar}" class="w-full h-full rounded-full object-cover">`;
  }

  const followersCountEl = document.getElementById('profileFollowersCount');
  if (followersCountEl) followersCountEl.innerText = savedFollowers;

  const tickElement = document.getElementById('profileGreenTick');
  if (tickElement) {
    if (savedFollowers >= 10000) {
      tickElement.classList.remove('hidden');
    } else {
      tickElement.classList.add('hidden');
    }
  }
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
  article.className = 'p-4 bg-black border-b border-gray-900 hover:bg-gray-950/40 transition-all duration-200 post-item';
  article.id = 'post-' + post.id;

  let mediaHtml = '';
  if (post.media_url) {
    mediaHtml = `<img src="${post.media_url}" class="w-full max-h-80 object-cover rounded-2xl mt-3 border border-gray-800"/>`;
  }

  const timeText = typeof calculateTimeAgo === 'function' ? calculateTimeAgo(post.created_at) : 'Just now';
  const currentUserName = localStorage.getItem('pktweed_profile_name') || post.user_name || 'Makki';
  const followersCount = parseInt(localStorage.getItem('pktweed_followers') || '2500');
  const showTick = (currentUserName === 'Makki' && followersCount >= 10000) || post.verified;

  article.innerHTML = `
    <div class="flex gap-3">
      <div class="w-10 h-10 rounded-full bg-sky-500 flex-shrink-0 flex items-center justify-center font-bold text-black shadow-md overflow-hidden">
        ${escapeHTML(currentUserName[0])}
      </div>
      <div class="w-full relative">
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
          <span class="font-bold text-white">${escapeHTML(currentUserName)}</span>
          ${showTick ? '<i class="fas fa-check-circle text-sky-400 text-xs"></i>' : ''}
          <span class="text-gray-500 text-sm">· ${timeText}</span>
        </div>
        <p class="text-white mt-2 text-sm leading-relaxed">${escapeHTML(post.content || '')}</p>
        ${mediaHtml}
        <div class="flex justify-between text-gray-500 text-sm mt-3 max-w-md pr-2 pt-1">
          <button onclick="toggleCommentBox('${post.id}')" class="hover:text-sky-400 flex items-center gap-2 text-gray-500 transition"><i class="far fa-comment"></i> <span id="cm-cnt-${post.id}">${post.comments_count || 0}</span></button>
          <button onclick="toggleRetweet(this, '${post.id}')" class="hover:text-green-500 flex items-center gap-2 text-gray-500"><i class="fas fa-retweet"></i> <span class="rt-cnt">${post.retweets || 0}</span></button>
          <button onclick="toggleLike(this, '${post.id}')" class="hover:text-pink-500 flex items-center gap-2 text-gray-500"><i class="far fa-heart"></i> <span class="like-cnt">${post.likes || 0}</span></button>
          <button onclick="toggleBookmark(this, '${post.id}')" class="hover:text-sky-400 text-gray-500"><i class="far fa-bookmark"></i></button>
          <button onclick="sharePost()" class="hover:text-sky-400 text-gray-500 transition"><i class="far fa-share-square"></i></button>
        </div>

        <div id="commentSection-${post.id}" class="hidden mt-3 pt-3 border-t border-gray-900">
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

  const myPosts = posts.filter(p => p);

  if (!myPosts || myPosts.length === 0) {
    profContainer.innerHTML = `<p class="text-gray-500 text-sm py-6">Your published tweeds will appear here.</p>`;
    return;
  }

  profContainer.innerHTML = '';
  myPosts.forEach(post => {
    const article = document.createElement('article');
    article.className = 'p-4 bg-black border-b border-gray-900 hover:bg-gray-950/40 transition-all duration-200 post-item relative text-left';
    article.id = 'profile-post-' + post.id;

    let mediaHtml = '';
    if (post.media_url) {
      mediaHtml = `<img src="${post.media_url}" class="w-full max-h-80 object-cover rounded-2xl mt-3 border border-gray-800"/>`;
    }

    const timeText = typeof calculateTimeAgo === 'function' ? calculateTimeAgo(post.created_at) : 'Just now';
    const currentUserName = localStorage.getItem('pktweed_profile_name') || post.user_name || 'Makki';
    const followersCount = parseInt(localStorage.getItem('pktweed_followers') || '2500');
    const showTick = (currentUserName === 'Makki' && followersCount >= 10000) || post.verified;

    article.innerHTML = `
      <div class="flex gap-3">
        <div class="w-10 h-10 rounded-full bg-sky-500 flex-shrink-0 flex items-center justify-center font-bold text-black shadow-md overflow-hidden">
          ${escapeHTML(currentUserName[0])}
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
            <span class="font-bold text-white">${escapeHTML(currentUserName)}</span>
            ${showTick ? '<i class="fas fa-check-circle text-sky-400 text-xs"></i>' : ''}
            <span class="text-gray-500 text-sm">· ${timeText}</span>
          </div>
          <p class="text-white mt-2 text-sm leading-relaxed">${escapeHTML(post.content || '')}</p>
          ${mediaHtml}
          
          <div class="flex justify-between text-gray-500 text-sm mt-3 max-w-md pr-2 pt-1">
            <button onclick="toggleCommentBox('prof-${post.id}')" class="hover:text-sky-400 flex items-center gap-2 text-gray-500 transition"><i class="far fa-comment"></i> <span id="cm-cnt-prof-${post.id}">${post.comments_count || 0}</span></button>
            <button onclick="toggleRetweet(this, 'prof-${post.id}')" class="hover:text-green-500 flex items-center gap-2 text-gray-500"><i class="fas fa-retweet"></i> <span class="rt-cnt">${post.retweets || 0}</span></button>
            <button onclick="toggleLike(this, 'prof-${post.id}')" class="hover:text-pink-500 flex items-center gap-2 text-gray-500"><i class="far fa-heart"></i> <span class="like-cnt">${post.likes || 0}</span></button>
            <button onclick="toggleBookmark(this, 'prof-${post.id}')" class="hover:text-sky-400 text-gray-500"><i class="far fa-bookmark"></i></button>
            <button onclick="sharePost()" class="hover:text-sky-400 text-gray-500 transition"><i class="far fa-share-square"></i></button>
          </div>

          <div id="commentSection-prof-${post.id}" class="hidden mt-3 pt-3 border-t border-gray-900">
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

function openEditProfileModal() {
  document.getElementById('editProfileModal')?.classList.remove('hidden');
  document.getElementById('editNameInput').value = document.getElementById('profileNameDisplay')?.innerText || 'Makki';
  document.getElementById('editHandleInput').value = document.getElementById('profileHandleDisplay')?.innerText || '@makki';
  document.getElementById('editBioInput').value = document.getElementById('profileBioDisplay')?.innerText || 'Full Stack Developer & Tech Entrepreneur from Multan 🇵🇰';
  document.getElementById('editFollowersInput').value = localStorage.getItem('pktweed_followers') || '2500';
}

function closeEditProfileModal() {
  document.getElementById('editProfileModal')?.classList.add('hidden');
}

function saveProfileChanges() {
  const newName = document.getElementById('editNameInput').value.trim();
  const newHandle = document.getElementById('editHandleInput').value.trim();
  const newAvatar = document.getElementById('editAvatarInput').value.trim();
  const newBio = document.getElementById('editBioInput').value.trim();
  const followersCount = parseInt(document.getElementById('editFollowersInput').value) || 0;

  if (!newName) {
    alert('Name cannot be empty!');
    return;
  }

  localStorage.setItem('pktweed_profile_name', newName);
  localStorage.setItem('pktweed_profile_handle', newHandle);
  if (newAvatar) localStorage.setItem('pktweed_profile_avatar', newAvatar);
  localStorage.setItem('pktweed_profile_bio', newBio);
  localStorage.setItem('pktweed_followers', followersCount);

  document.getElementById('profileNameDisplay').innerText = newName;
  document.getElementById('profileHandleDisplay').innerText = newHandle;
  document.getElementById('profileBioDisplay').innerText = newBio;
  document.getElementById('profileFollowersCount').innerText = followersCount;
  
  const headerUserName = document.getElementById('headerUserName');
  if (headerUserName) headerUserName.innerText = newName;

  if (newAvatar) {
    const avatarBig = document.getElementById('profileAvatarBig');
    const headerAvatar = document.getElementById('headerUserAvatar');
    if (avatarBig) avatarBig.innerHTML = `<img src="${newAvatar}" class="w-full h-full rounded-full object-cover">`;
    if (headerAvatar) headerAvatar.innerHTML = `<img src="${newAvatar}" class="w-full h-full rounded-full object-cover">`;
  }

  const tickElement = document.getElementById('profileGreenTick');
  if (followersCount >= 10000) {
    if (tickElement) tickElement.classList.remove('hidden');
    alert(`🎉 Mubarak ho! Followers ${followersCount} ho gaye hain. Tringo AI ne Green Tick 🟢 activate kar diya hai!`);
  } else {
    if (tickElement) tickElement.classList.add('hidden');
    alert('Profile updated successfully! (Green Tick unlocks at 10,000 followers 🚀)');
  }

  closeEditProfileModal();
  loadSmartFeed();
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
    wrap.className = 'bg-black border-b border-gray-900 p-3 text-left mb-3';
    wrap.innerHTML = item.html;
    container.appendChild(wrap);
  });
}

function createNewModalPost() {
  const inputEl = document.getElementById('modalPostInput');
  const textVal = inputEl ? inputEl.value : '';
  if (!textVal.trim() && !activeMedia) return;

  const currentUserName = localStorage.getItem('pktweed_profile_name') || 'Makki';
  const currentHandle = localStorage.getItem('pktweed_profile_handle') || '@makki';

  const newPostData = {
    id: 'post_' + Date.now(),
    user_name: currentUserName,
    user_handle: currentHandle,
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
    
