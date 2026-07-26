import React from 'react';

export default function Logo({ size = 28, withText = true, withTagline = false }) {
  const w = size;
  return (
    <div className="flex items-center gap-2 select-none">
      <svg width={w} height={w} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <linearGradient id="oltaniAccent" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF7A47" />
            <stop offset="1" stopColor="#FF5A1F" />
          </linearGradient>
        </defs>
        {/* Hex skeleton */}
        <path d="M24 3 L41 13 V35 L24 45 L7 35 V13 Z" stroke="rgb(var(--muted) / 0.35)" strokeWidth="1.5" fill="none" />
        {/* Inner glyph "O" = circle + diagonal mark, suggests "OLTANI" */}
        <circle cx="24" cy="24" r="10" stroke="url(#oltaniAccent)" strokeWidth="2.5" fill="none" />
        <path d="M19 29 L29 19" stroke="url(#oltaniAccent)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="24" r="2.5" fill="url(#oltaniAccent)" />
      </svg>
      {withText && (
        <div className="leading-none">
          <div className="font-bold text-fg tracking-tight" style={{ fontSize: size * 0.6 }}>
            OLT<span className="text-accent">ANI</span>
          </div>
          {withTagline && (
            <div className="text-[10px] text-muted mt-0.5 font-medium tracking-wide">
              Open Link Tech & AI Network Intelligence
            </div>
          )}
        </div>
      )}
    </div>
  );
}
