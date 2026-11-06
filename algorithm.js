/* PkTweed - Ultimate Hybrid TikTok + X Algorithm & Time Engine (algorithm.js) - v11.0 */

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

// Hybrid TikTok + X Smart Ranking Algorithm with Tringo AI Integration
function sortPostsByXAlgorithm(posts) {
  if (!posts || posts.length === 0) return [];

  const now = new Date().getTime();

  return posts.sort((a, b) => {
    // Engagement Weights (X-Style + TikTok Momentum)
    const likesA = a.likes || 0;
    const likesB = b.likes || 0;
    const retweetsA = a.retweets || a.retweeds || 0;
    const retweetsB = b.retweets || b.retweeds || 0;
    const commentsA = a.comments_count || a.replies || 0;
    const commentsB = b.comments_count || b.replies || 0;

    const scoreA = (likesA * 2) + (retweetsA * 3) + (commentsA * 4);
    const scoreB = (likesB * 2) + (retweetsB * 3) + (commentsB * 4);

    // Recency & Age Gravity (TikTok Fast-paced decay factor)
    const timeA = new Date(a.created_at || a.timestamp || now).getTime();
    const timeB = new Date(b.created_at || b.timestamp || now).getTime();
    
    const ageHoursA = Math.max(1, (now - timeA) / (1000 * 60 * 60));
    const ageHoursB = Math.max(1, (now - timeB) / (1000 * 60 * 60));

    // Pakistan Trend Boost factor
    let trendMultiplierA = 1.0;
    let trendMultiplierB = 1.0;
    if (a.content && (a.content.includes('#') || a.content.toLowerCase().includes('pakistan'))) trendMultiplierA = 1.3;
    if (b.content && (b.content.includes('#') || b.content.toLowerCase().includes('pakistan'))) trendMultiplierB = 1.3;

    // Final Hybrid Formula (Engagement * Trend Boost / Recency Decay)
    const finalScoreA = ((scoreA * trendMultiplierA * 100) / Math.pow(ageHoursA + 2, 1.4));
    const finalScoreB = ((scoreB * trendMultiplierB * 100) / Math.pow(ageHoursB + 2, 1.4));

    return finalScoreB - finalScoreA;
  });
}

// Tringo AI Creator Milestone & Green Tick Verification Algorithm
function evaluateCreatorMilestone(followerCount) {
  if (followerCount >= 10000) {
    return {
      isVerified: true,
      badge: 'Green Tick 🟢',
      discountOffer: '50% OFF on Premium Features & Creator Wallet Boost',
      status: 'Active VIP Creator'
    };
  }
  return {
    isVerified: false,
    badge: 'Standard',
    discountOffer: 'Unlock at 10k Followers',
    status: 'Growing'
  };
      }
