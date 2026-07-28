import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FaqAccordion = ({ faqs }) => {
  const [open, setOpen] = useState(null);
  if (!faqs || faqs.length === 0) return null;
  const sorted = [...faqs].sort((a, b) => (a.order || 0) - (b.order || 0));
  return (
    <div className="space-y-2">
      {sorted.map((faq, i) => (
        <div key={faq._id || i} className="bg-darkCard border border-darkBorder rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-darkBg/40 transition-colors"
          >
            <span className="font-bold text-slate-900 dark:text-white text-sm pr-4">{faq.question}</span>
            <ChevronDown className={`w-4 h-4 text-accentBlue shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && (
            <div className="px-5 pb-5 text-slate-700 dark:text-slate-300 text-sm leading-relaxed border-t border-darkBorder/50 pt-4">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FaqAccordion;
