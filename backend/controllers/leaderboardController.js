import User from '../models/User.js';

/**
 * @desc    Get leaderboard rankings
 * @route   GET /api/leaderboard
 * @access  Public
 */
export const getLeaderboard = async (req, res) => {
  try {
    // Aggregate to count the size of solvedQuestions array
    const rankings = await User.aggregate([
      {
        $match: { 
          role: { $ne: 'admin' },
          isVerified: true
        }
      },
      {
        $project: {
          username: 1,
          email: 1,
          solvedCount: 1,
          submissionsCount: 1,
          solvedQuestionsCount: { $size: "$solvedQuestions" }
        }
      },
      { $sort: { solvedQuestionsCount: -1, submissionsCount: 1 } }, // primary sort by solved count, secondary by fewer attempts
      { $limit: 100 } // Top 100
    ]);

    res.json(rankings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
