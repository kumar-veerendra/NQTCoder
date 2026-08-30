import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getMyTestimonial, submitTestimonial } from '../../services/testimonialService';
import { Star, X, CheckCircle2, ShieldCheck, Sparkles, LogIn, AlertCircle } from 'lucide-react';

const USAGE_OPTIONS = [
  { id: 'coding', label: 'Coding Practice' },
  { id: 'aptitude', label: 'Aptitude Arena' },
  { id: 'cognitive_games', label: 'Cognitive Games' },
  { id: 'mock_tests', label: 'Timed Mock Tests' },
  { id: 'verbal', label: 'Verbal Ability' },
  { id: 'company_guides', label: 'Company Guides' },
  { id: 'other', label: 'Other' },
];

const RATING_LABELS = {
  1: 'Needs Improvement',
  2: 'Fair Experience',
  3: 'Good Platform',
  4: 'Very Helpful',
  5: 'Outstanding / 5-Star!',
};

const ReviewModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState('yes');
  const [usageAreas, setUsageAreas] = useState(['coding', 'mock_tests']);
  const [isEditing, setIsEditing] = useState(false);
  const [existingStatus, setExistingStatus] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetchingExisting, setFetchingExisting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch current user's review if logged in
  useEffect(() => {
    if (isOpen && user) {
      setError('');
      setIsSuccess(false);
      setFetchingExisting(true);

      getMyTestimonial()
        .then((res) => {
          if (res.testimonial) {
            setIsEditing(true);
            setRating(res.testimonial.rating || 5);
            setReview(res.testimonial.review || '');
            setWouldRecommend(res.testimonial.wouldRecommend || 'yes');
            setUsageAreas(res.testimonial.usageAreas || ['coding']);
            setExistingStatus(res.testimonial.status);
          } else {
            setIsEditing(false);
            setRating(5);
            setReview('');
            setWouldRecommend('yes');
            setUsageAreas(['coding', 'mock_tests']);
            setExistingStatus(null);
          }
        })
        .catch(() => {
          // Non-blocking fallback
          setIsEditing(false);
        })
        .finally(() => {
          setFetchingExisting(false);
        });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const toggleUsageArea = (areaId) => {
    setUsageAreas((prev) =>
      prev.includes(areaId) ? prev.filter((item) => item !== areaId) : [...prev, areaId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!review.trim()) {
      setError('Please share a few sentences about your experience.');
      return;
    }
    if (review.trim().length > 500) {
      setError('Review cannot exceed 500 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await submitTestimonial({
        rating,
        review: review.trim(),
        wouldRecommend,
        usageAreas,
      });

      setIsSuccess(true);
      setSuccessMessage(
        res.message || 'Thank you! Your review has been submitted for moderation.'
      );
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-darkCard border border-darkBorder rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-100">
        {/* Background glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-accentBlue/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-darkBg/60 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {!user ? (
          /* Logged-out State */
          <div className="py-8 text-center space-y-5 select-none">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-accentBlue/10 border border-accentBlue/20 flex items-center justify-center text-accentBlue">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white">Share Your NQTCoder Experience</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Log in with your student account to share your ratings, practice feedback, and placement experience.
              </p>
            </div>
            <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  onClose();
                  navigate('/login?redirect=/');
                }}
                className="bg-accentBtn hover:bg-accentBtnHover text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-lg shadow-accentBtn/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to Review</span>
              </button>
              <button
                onClick={onClose}
                className="bg-transparent border border-darkBorder hover:border-slate-600 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : isSuccess ? (
          /* Submission Success State */
          <div className="py-8 text-center space-y-5 animate-fadeIn select-none">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white">Review Submitted!</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                {successMessage}
              </p>
            </div>
            <div className="bg-darkBg/60 border border-darkBorder rounded-xl p-3 text-[11px] text-slate-400 max-w-sm mx-auto flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-accentBlue shrink-0" />
              <span>We maintain genuine social proof by quickly verifying all student reviews.</span>
            </div>
            <div className="pt-3">
              <button
                onClick={onClose}
                className="bg-accentBtn hover:bg-accentBtnHover text-white font-bold text-xs uppercase tracking-wider px-8 py-3 rounded-xl transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Active Review Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-accentBlue text-[10px] font-bold uppercase tracking-widest bg-accentBlue/10 border border-accentBlue/20 px-2.5 py-1 rounded-full mb-2">
                <Sparkles className="w-3 h-3" />
                <span>{isEditing ? 'Update Review' : 'Student Review'}</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {isEditing ? 'Edit Your Experience' : 'Share Your Experience'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Help fellow engineering students prepare by sharing your genuine thoughts.
              </p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isEditing && existingStatus === 'approved' && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-2.5 rounded-xl text-[11px] flex items-center space-x-2">
                <span>Note: Editing an approved review will temporarily set it to pending for re-moderation.</span>
              </div>
            )}

            {/* 1. Rating Selector */}
            <div className="space-y-2 select-none">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                How would you rate NQTCoder?
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 rounded-lg hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          isFilled
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-xs font-bold text-amber-400 ml-2">
                  {RATING_LABELS[hoverRating || rating]}
                </span>
              </div>
            </div>

            {/* 2. Review Textarea */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                <label>Your Review</label>
                <span className={review.length > 480 ? 'text-amber-400' : 'text-slate-500'}>
                  {review.length}/500
                </span>
              </div>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                maxLength={500}
                required
                rows={3}
                placeholder="What did you like about the questions, mock timers, or cognitive games? Did it help you prepare for campus placement exams?"
                className="w-full bg-darkBg border border-darkBorder px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200 resize-none transition-colors"
              />
            </div>

            {/* 3. Usage Area Pills */}
            <div className="space-y-1.5 select-none">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                What features did you practice with?
              </label>
              <div className="flex flex-wrap gap-1.5">
                {USAGE_OPTIONS.map((opt) => {
                  const active = usageAreas.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleUsageArea(opt.id)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        active
                          ? 'bg-accentBlue/10 border-accentBlue text-accentBlue'
                          : 'bg-darkBg/60 border-darkBorder text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Recommendation */}
            <div className="space-y-1.5 select-none">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Would you recommend NQTCoder to others?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'yes', label: '👍 Yes' },
                  { value: 'maybe', label: '🤔 Maybe' },
                  { value: 'no', label: '👎 No' },
                ].map((rec) => (
                  <button
                    key={rec.value}
                    type="button"
                    onClick={() => setWouldRecommend(rec.value)}
                    className={`py-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                      wouldRecommend === rec.value
                        ? 'bg-accentBlue/10 border-accentBlue text-accentBlue shadow-md shadow-accentBlue/10'
                        : 'bg-darkBg/60 border-darkBorder text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {rec.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end space-x-3 select-none">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-darkBorder hover:border-slate-600 text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || fetchingExisting}
                className="bg-accentBtn hover:bg-accentBtnHover disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-lg shadow-accentBtn/20 flex items-center space-x-2 transition-all cursor-pointer"
              >
                <span>{loading ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
