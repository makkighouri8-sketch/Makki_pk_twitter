/* PkTweed - X-Style Algorithm & Time Engine (algorithm.js) - v1.0 */

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
function sortPostsByXAlgorithm(posts) {
  return posts.sort((a, b) => {
    const scoreA = (a.likes * 2) + (a.retweets * 3) + (a.comments_count || 0 * 4);
    const scoreB = (b.likes * 2) + (b.retweets * 3) + (b.comments_count || 0 * 4);
    const timeA = new Date(a.created_at || Date.now()).getTime();
    const timeB = new Date(b.created_at || Date.now()).getTime();
    return (scoreB * 10 + timeB) - (scoreA * 10 + timeA);
  });
}
