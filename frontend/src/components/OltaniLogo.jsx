import React from 'react';

export default function OltaniLogo({ size = 'medium', showTagline = true }) {
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const iconWidth = isSmall ? 36 : isLarge ? 64 : 46;
  const fontSize = isSmall ? '1.2rem' : isLarge ? '2.2rem' : '1.5rem';
  const taglineSize = isSmall ? '0.5rem' : isLarge ? '0.75rem' : '0.6rem';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', selectUser: 'none' }}>
      
      {/* OLTANI Neural Vector Icon matching user logo image */}
      <svg
        width={iconWidth}
        height={iconWidth}
        viewBox="0 0 200 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 210, 255, 0.3))' }}
      >
        <defs>
          <linearGradient id="cyanBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d2ff" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff5500" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          <filter id="glowCircle" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Left Hexagon Neural Network (Blue / Cyan) */}
        <g stroke="url(#cyanBlueGrad)" strokeWidth="2.5" strokeLinecap="round">
          {/* Outer Hexagon Lines */}
          <path d="M 60 20 L 110 50 L 110 110 L 60 140 L 10 110 L 10 50 Z" />
          <path d="M 60 20 L 60 140" />
          <path d="M 10 50 L 110 110" />
          <path d="M 10 110 L 110 50" />

          {/* Inner Hexagon Lines */}
          <path d="M 60 45 L 85 60 L 85 95 L 60 110 L 35 95 L 35 60 Z" />
          <path d="M 60 45 L 60 110" />
        </g>

        {/* Right Arrow Network (Orange / Gold) */}
        <g stroke="url(#orangeGrad)" strokeWidth="2.5" strokeLinecap="round">
          <path d="M 110 50 L 145 20 L 185 80 L 145 140 L 110 110" />
          <path d="M 110 50 L 145 80 L 185 80" />
          <path d="M 110 110 L 145 80" />
          <path d="M 145 20 L 145 140" />
        </g>

        {/* Glowing Nodes (Blue/Cyan Left) */}
        <g fill="#00d2ff">
          <circle cx="60" cy="20" r="5" />
          <circle cx="110" cy="50" r="5" />
          <circle cx="110" cy="110" r="5" />
          <circle cx="60" cy="140" r="5" />
          <circle cx="10" cy="110" r="5" />
          <circle cx="10" cy="50" r="5" />
          <circle cx="60" cy="80" r="8" fill="#00ffff" filter="url(#glowCircle)" />
        </g>

        {/* Glowing Nodes (Orange/Gold Right) */}
        <g fill="#ff5500">
          <circle cx="145" cy="20" r="5" fill="#f59e0b" />
          <circle cx="185" cy="80" r="6" fill="#ff5500" filter="url(#glowCircle)" />
          <circle cx="145" cy="140" r="5" fill="#ff7700" />
          <circle cx="145" cy="80" r="5" fill="#f59e0b" />
        </g>
      </svg>

      {/* Brand Text Header */}
      <div>
        <div style={{ fontSize: fontSize, fontWeight: 900, letterSpacing: '0.05em', lineHeight: 1 }}>
          <span style={{ color: 'var(--brand-gray)' }}>OLT</span>
          <span style={{ color: 'var(--brand-orange)' }}>ANI</span>
        </div>
        {showTagline && (
          <div style={{
            fontSize: taglineSize,
            fontWeight: 700,
            color: 'var(--text-secondary)',
            letterSpacing: '0.04em',
            marginTop: '0.2rem',
            whiteSpace: 'nowrap',
            opacity: 0.85
          }}>
            OPEN LINK TECHNOLOGIES & ARTIFICIAL NETWORK INTELLIGENCE
          </div>
        )}
      </div>

    </div>
  );
}
