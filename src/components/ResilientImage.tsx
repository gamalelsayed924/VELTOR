import React, { useState } from 'react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string;
  fallbackLabel?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  aspectClass = '',
  fallbackLabel = 'VELTOR ARTWORK',
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-[#16161D] via-[#101015] to-[#0B0B0E] border border-white/10 p-6 text-center select-none ${aspectClass}`}
        role="img"
        aria-label={alt}
      >
        <svg
          className="w-12 h-12 text-[#C6A365]/60 mb-3"
          viewBox="0 0 64 32"
          fill="none"
           stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M6 22 L14 14 L28 11 L46 11 L58 18 L60 22 Z" />
          <circle cx="18" cy="22" r="4" />
          <circle cx="48" cy="22" r="4" />
        </svg>
        <span className="font-brand text-xs tracking-[0.25em] text-[#F4F1EA]/80 uppercase">
          {fallbackLabel}
        </span>
        <span className="mt-1 text-[11px] text-[#9E9A90] max-w-[24ch] line-clamp-2">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
};
