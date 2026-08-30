import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, ShieldCheck, Sparkles, ThumbsUp, Quote } from 'lucide-react';

const USAGE_MAP = {
  coding: 'Coding',
  aptitude: 'Aptitude',
  logical_reasoning: 'Logical',
  verbal: 'Verbal',
  mock_tests: 'Mock Tests',
  cognitive_games: 'Games',
  company_guides: 'Guides',
  other: 'Placement',
};

const TestimonialCarousel = ({ testimonials = [], onOpenReviewModal }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const touchStartX = useRef(null);

  // Responsive visible cards count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const total = testimonials.length;
  const maxIndex = Math.max(0, total - visibleCount);

  // Card-by-card auto-sliding timer (5s interval)
  useEffect(() => {
    if (total <= visibleCount || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [total, visibleCount, maxIndex, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    setIsPaused(false);
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  // If 0 approved reviews, display authentic empty state
  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="bg-darkCard/60 border border-darkBorder rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xl select-none relative overflow-hidden">
        <div className="premium-shine rounded-3xl"></div>
        <div className="space-y-4 relative z-10">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-accentBlue/10 border border-accentBlue/20 flex items-center justify-center text-accentBlue">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Be One of the First Students to Review</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Have you practiced company coding questions, solved cognitive games, or taken a mock test on NQTCoder? Share your thoughts to help future students!
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenReviewModal}
              className="bg-accentBtn hover:bg-accentBtnHover text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-lg shadow-accentBtn/20 inline-flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Share Your Experience</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate card translation percentage
  const cardWidthPercent = 100 / visibleCount;
  const translateX = -(currentIndex * cardWidthPercent);

  return (
    <div
      className="relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Carousel Track Container */}
      <div className="overflow-hidden py-4 -mx-2 sm:-mx-3">
        <div
          className="flex transition-transform duration-500 ease-in-out motion-reduce:transition-none"
          style={{ transform: `translateX(${translateX}%)` }}
        >
          {testimonials.map((t, index) => {
            const displayName = t.user?.displayName || t.user?.username || 'NQTCoder Student';
            const initials = displayName
              .split(' ')
              .map((w) => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={t._id || index}
                className="px-2 sm:px-3 shrink-0 flex"
                style={{ width: `${cardWidthPercent}%` }}
              >
                <div className="w-full bg-darkCard border border-darkBorder rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl hover:border-slate-700 transition-colors relative overflow-hidden group">
                  <div className="premium-shine rounded-3xl"></div>

                  <div className="space-y-4 relative z-10">
                    {/* Card Header: Stars & Recommendation */}
                    <div className="flex items-center justify-between">
                      {/* Star Rating */}
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= t.rating
                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Recommend Tag */}
                      {t.wouldRecommend === 'yes' && (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          <ThumbsUp className="w-2.5 h-2.5" />
                          <span>Recommends</span>
                        </span>
                      )}
                    </div>

                    {/* Review Body */}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal italic line-clamp-4">
                      "{t.review}"
                    </p>

                    {/* Usage Tag Pills */}
                    {t.usageAreas && t.usageAreas.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {t.usageAreas.slice(0, 3).map((area) => (
                          <span
                            key={area}
                            className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-darkBg border border-darkBorder px-2 py-0.5 rounded"
                          >
                            {USAGE_MAP[area] || area}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Student Info */}
                  <div className="pt-6 mt-4 border-t border-darkBorder/60 flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-3">
                      {/* Avatar Circle */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-accentBlue to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-accentBlue/20 shrink-0">
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-xs font-bold text-white truncate">{displayName}</h4>
                          <ShieldCheck className="w-3.5 h-3.5 text-accentBlue shrink-0" title="Verified Review" />
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">NQTCoder Student</p>
                      </div>
                    </div>

                    {/* Review Date */}
                    {t.createdAt && (
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {new Date(t.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls (Only shown if total cards > visible cards) */}
      {total > visibleCount && (
        <div className="flex items-center justify-between pt-4 px-2">
          {/* Dot Indicators */}
          <div className="flex items-center space-x-1.5">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? 'w-6 bg-accentBlue' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          {/* Arrow Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              aria-label="Previous review"
              className="p-2 rounded-xl bg-darkCard border border-darkBorder hover:border-slate-600 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next review"
              className="p-2 rounded-xl bg-darkCard border border-darkBorder hover:border-slate-600 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialCarousel;
