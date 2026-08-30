import React from 'react';

export const GeometricShape = ({
  symbol,
  shapeType,
  color,
  className = 'w-10 h-10 sm:w-12 sm:h-12',
}) => {
  // Normalize symbol or shapeType
  if (symbol === '▲' || symbol === '△' || shapeType === 'triangle') {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <polygon points="50,14 88,86 12,86" fill={color || '#1d4ed8'} />
      </svg>
    );
  }

  if (symbol === '●' || symbol === '○' || shapeType === 'circle') {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="38" fill={color || '#65a30d'} />
      </svg>
    );
  }

  if (symbol === '■' || symbol === '□' || shapeType === 'square') {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <rect x="16" y="16" width="68" height="68" fill={color || '#dc2626'} rx="6" />
      </svg>
    );
  }

  if (symbol === '✚' || symbol === '+' || shapeType === 'plus') {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <path
          d="M38,15 L62,15 L62,38 L85,38 L85,62 L62,62 L62,85 L38,85 L38,62 L15,62 L15,38 L38,38 Z"
          fill={color || '#84cc16'}
        />
      </svg>
    );
  }

  if (symbol === '★' || shapeType === 'star') {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <polygon
          points="50,10 62,37 91,37 68,55 77,83 50,66 23,83 32,55 9,37 38,37"
          fill={color || '#eab308'}
        />
      </svg>
    );
  }

  if (symbol === '◆' || symbol === '◇' || shapeType === 'diamond') {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <polygon points="50,12 88,50 50,88 12,50" fill={color || '#9333ea'} />
      </svg>
    );
  }

  if (symbol === '⬡' || shapeType === 'hexagon') {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <polygon points="50,12 85,32 85,68 50,88 15,68 15,32" fill={color || '#06b6d4'} />
      </svg>
    );
  }

  // Fallback text if not a geometric symbol
  return <span className="font-black text-2xl">{symbol}</span>;
};

export default GeometricShape;
