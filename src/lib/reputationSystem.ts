export const REPUTATION_POINTS = {
  REVIEW_GIVEN: 10,           // Base points for giving a review
  REVIEW_ACCEPTED: 15,        // Additional points when review is marked helpful
  REVIEW_QUALITY: {
    SHORT: 2,                 // < 50 words
    MEDIUM: 5,                // 50-200 words
    DETAILED: 10              // > 200 words
  },
  CODE_SUBMISSION: 5,         // Points for submitting code
  SUBMISSION_APPROVED: 8,     // Points when submission is approved
  STREAK_BONUS: {
    WEEKLY: 20,              // Bonus for reviewing code every week
    MONTHLY: 50              // Additional monthly bonus
  },
  ACHIEVEMENT_BONUSES: {
    FIRST_REVIEW: 25,        // First review milestone
    TENTH_REVIEW: 100,       // 10 reviews milestone
    FIRST_ACCEPTED: 30,      // First accepted review
    QUALITY_STREAK: 50       // 5 consecutive detailed reviews
  }
};

export const calculateReviewPoints = (review: {
  content: string;
  isAccepted?: boolean;
}) => {
  let points = REPUTATION_POINTS.REVIEW_GIVEN;

  // Add points based on review quality
  const wordCount = review.content.trim().split(/\s+/).length;
  if (wordCount > 200) {
    points += REPUTATION_POINTS.REVIEW_QUALITY.DETAILED;
  } else if (wordCount >= 50) {
    points += REPUTATION_POINTS.REVIEW_QUALITY.MEDIUM;
  } else {
    points += REPUTATION_POINTS.REVIEW_QUALITY.SHORT;
  }

  // Add bonus if review was marked as helpful
  if (review.isAccepted) {
    points += REPUTATION_POINTS.REVIEW_ACCEPTED;
  }

  return points;
}; 