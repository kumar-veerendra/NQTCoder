import Testimonial from '../models/Testimonial.js';

/**
 * @desc    Get all public approved testimonials
 * @route   GET /api/testimonials
 * @access  Public
 */
export const getApprovedTestimonials = async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
    
    // Configurable Extensible Sorting: rating DESC, createdAt DESC
    const sortField = req.query.sortBy === 'featured' 
      ? { isFeatured: -1, rating: -1, createdAt: -1 }
      : { rating: -1, createdAt: -1 };

    const testimonials = await Testimonial.find({ status: 'approved' })
      .populate('user', 'username name')
      .sort(sortField)
      .limit(limit)
      .lean();

    // Map and sanitize to ensure strict privacy (never expose email or private metadata)
    const sanitized = testimonials.map((t) => {
      const username = t.user?.username || 'Student';
      const displayName = t.user?.name || t.user?.username || 'NQTCoder Student';

      return {
        _id: t._id,
        rating: t.rating,
        review: t.review,
        wouldRecommend: t.wouldRecommend || 'yes',
        usageAreas: t.usageAreas || [],
        isFeatured: Boolean(t.isFeatured),
        createdAt: t.createdAt,
        user: {
          username,
          displayName,
        },
      };
    });

    res.json({
      success: true,
      count: sanitized.length,
      testimonials: sanitized,
    });
  } catch (error) {
    console.error('Error fetching approved testimonials:', error);
    res.status(500).json({ message: 'Server error retrieving testimonials', error: error.message });
  }
};

/**
 * @desc    Get current user's submitted testimonial (if any)
 * @route   GET /api/testimonials/my
 * @access  Private
 */
export const getMyTestimonial = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Find the user's active or latest testimonial
    const testimonial = await Testimonial.findOne({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      testimonial: testimonial || null,
    });
  } catch (error) {
    console.error('Error fetching user testimonial:', error);
    res.status(500).json({ message: 'Server error retrieving your review', error: error.message });
  }
};

/**
 * @desc    Submit or update user testimonial (One active review per user)
 * @route   POST /api/testimonials
 * @access  Private
 */
export const submitOrUpdateTestimonial = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please log in to submit a review.' });
    }

    const { rating, review, wouldRecommend = 'yes', usageAreas = [] } = req.body;

    // Validation
    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5 stars.' });
    }

    if (!review || typeof review !== 'string' || !review.trim()) {
      return res.status(400).json({ message: 'Please write a review describing your experience.' });
    }

    if (review.trim().length > 500) {
      return res.status(400).json({ message: 'Review text cannot exceed 500 characters.' });
    }

    if (!['yes', 'maybe', 'no'].includes(wouldRecommend)) {
      return res.status(400).json({ message: 'Recommendation value must be Yes, Maybe, or No.' });
    }

    // Check if user already has an active (pending or approved) review
    let existingReview = await Testimonial.findOne({
      user: req.user._id,
      status: { $in: ['pending', 'approved'] },
    });

    if (existingReview) {
      // Update in-place and reset to pending for admin re-moderation
      existingReview.rating = numRating;
      existingReview.review = review.trim();
      existingReview.wouldRecommend = wouldRecommend;
      existingReview.usageAreas = Array.isArray(usageAreas) ? usageAreas : [];
      existingReview.status = 'pending';
      existingReview.approvedBy = null;
      existingReview.approvedAt = null;

      const updated = await existingReview.save();

      return res.status(200).json({
        success: true,
        message: 'Your review has been updated and submitted for moderation.',
        testimonial: updated,
      });
    }

    // Create a new testimonial
    const newTestimonial = await Testimonial.create({
      user: req.user._id,
      rating: numRating,
      review: review.trim(),
      wouldRecommend,
      usageAreas: Array.isArray(usageAreas) ? usageAreas : [],
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted and will appear publicly once approved.',
      testimonial: newTestimonial,
    });
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    res.status(500).json({ message: error.message || 'Server error submitting testimonial' });
  }
};

/**
 * @desc    Get all testimonials for Admin Moderation
 * @route   GET /api/testimonials/admin
 * @access  Private/Admin
 */
export const getAdminTestimonials = async (req, res) => {
  try {
    const { status, search } = req.query;

    const query = {};
    if (status && status !== 'all' && ['pending', 'approved', 'rejected', 'hidden'].includes(status)) {
      query.status = status;
    }

    if (search && search.trim()) {
      query.$or = [
        { review: { $regex: search.trim(), $options: 'i' } },
        { adminNote: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const testimonials = await Testimonial.find(query)
      .populate('user', 'username email role name')
      .populate('approvedBy', 'username')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate quick counts for admin tabs
    const [totalCount, pendingCount, approvedCount, rejectedCount, hiddenCount] = await Promise.all([
      Testimonial.countDocuments({}),
      Testimonial.countDocuments({ status: 'pending' }),
      Testimonial.countDocuments({ status: 'approved' }),
      Testimonial.countDocuments({ status: 'rejected' }),
      Testimonial.countDocuments({ status: 'hidden' }),
    ]);

    res.json({
      success: true,
      stats: {
        totalCount,
        pendingCount,
        approvedCount,
        rejectedCount,
        hiddenCount,
      },
      testimonials,
    });
  } catch (error) {
    console.error('Error fetching admin testimonials:', error);
    res.status(500).json({ message: 'Server error retrieving admin testimonials', error: error.message });
  }
};

/**
 * @desc    Moderate testimonial (Approve, Reject, Hide, Feature, or add Admin Note)
 * @route   PATCH /api/testimonials/admin/:id
 * @access  Private/Admin
 */
export const updateTestimonialStatus = async (req, res) => {
  try {
    const { status, isFeatured, adminNote } = req.body;

    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found.' });
    }

    if (status) {
      if (!['pending', 'approved', 'rejected', 'hidden'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
      }
      testimonial.status = status;
      if (status === 'approved') {
        testimonial.approvedBy = req.user._id;
        testimonial.approvedAt = new Date();
      }
    }

    if (typeof isFeatured === 'boolean') {
      testimonial.isFeatured = isFeatured;
    }

    if (typeof adminNote === 'string') {
      testimonial.adminNote = adminNote.trim();
    }

    const updated = await testimonial.save();

    res.json({
      success: true,
      message: `Testimonial updated successfully.`,
      testimonial: updated,
    });
  } catch (error) {
    console.error('Error updating testimonial status:', error);
    res.status(500).json({ message: 'Server error updating testimonial', error: error.message });
  }
};

/**
 * @desc    Delete a testimonial
 * @route   DELETE /api/testimonials/admin/:id
 * @access  Private/Admin
 */
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found.' });
    }

    await testimonial.deleteOne();

    res.json({
      success: true,
      message: 'Testimonial deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ message: 'Server error deleting testimonial', error: error.message });
  }
};
