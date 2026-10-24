import { useEffect, useState, type ReactNode } from 'react';
import type { ProductCategory } from '../lib/core';

const NAVY = '#0B2A5B';
const NAVY_LIGHT = '#1D4380';
const ORANGE = '#F28C28';
const PALE = '#DCE6F5';

export function PrinterIllustration() {
  return (
    <svg
      viewBox="0 0 240 180"
      className="illustration"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="120" cy="164" rx="88" ry="8" fill={NAVY} opacity="0.12" />
      <rect x="40" y="78" width="160" height="76" rx="8" fill={NAVY} />
      <rect x="48" y="50" width="144" height="30" rx="6" fill={NAVY_LIGHT} />
      <rect x="56" y="57" width="128" height="15" rx="3" fill={PALE} />
      <rect x="150" y="88" width="38" height="16" rx="3" fill={ORANGE} />
      <circle cx="160" cy="96" r="2.5" fill={NAVY} />
      <circle cx="170" cy="96" r="2.5" fill={NAVY} />
      <circle cx="180" cy="96" r="2.5" fill={NAVY} />
      <rect x="62" y="96" width="84" height="42" rx="2" fill="#fff" />
      <rect x="70" y="106" width="52" height="4" rx="2" fill="#C9D3E3" />
      <rect x="70" y="116" width="64" height="4" rx="2" fill="#C9D3E3" />
      <rect x="70" y="126" width="40" height="4" rx="2" fill="#C9D3E3" />
      <rect x="56" y="140" width="128" height="10" rx="3" fill={NAVY_LIGHT} />
    </svg>
  );
}

export function TonerIllustration() {
  return (
    <svg
      viewBox="0 0 240 180"
      className="illustration"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="120" cy="156" rx="84" ry="8" fill={NAVY} opacity="0.12" />
      <path
        d="M96 64 v-10 a6 6 0 0 1 6 -6 h36 a6 6 0 0 1 6 6 v10"
        fill="none"
        stroke={NAVY_LIGHT}
        strokeWidth="6"
      />
      <rect x="52" y="64" width="136" height="68" rx="10" fill={NAVY} />
      <rect x="52" y="64" width="136" height="14" rx="7" fill={NAVY_LIGHT} />
      <rect x="40" y="78" width="16" height="40" rx="4" fill={NAVY_LIGHT} />
      <rect x="184" y="78" width="16" height="40" rx="4" fill={NAVY_LIGHT} />
      <rect x="70" y="94" width="100" height="18" rx="3" fill={ORANGE} />
    </svg>
  );
}

export function ConsumableIllustration() {
  return (
    <svg
      viewBox="0 0 240 180"
      className="illustration"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="120" cy="156" rx="80" ry="8" fill={NAVY} opacity="0.12" />
      {[108, 78, 48].map((y, i) => (
        <g key={y}>
          <rect
            x="58"
            y={y}
            width="124"
            height="28"
            rx="4"
            fill="#fff"
            stroke={NAVY}
            strokeWidth="4"
          />
          <rect
            x={i % 2 === 0 ? 84 : 118}
            y={y + 2}
            width="34"
            height="24"
            fill={ORANGE}
          />
        </g>
      ))}
    </svg>
  );
}

export function GearIllustration() {
  const teeth = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <svg
      viewBox="0 0 240 180"
      className="illustration"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="120" cy="162" rx="70" ry="8" fill={NAVY} opacity="0.12" />
      <g transform="translate(120 86)">
        {teeth.map(angle => (
          <rect
            key={angle}
            x="-10"
            y="-62"
            width="20"
            height="26"
            rx="4"
            fill={NAVY}
            transform={`rotate(${angle})`}
          />
        ))}
        <circle r="48" fill={NAVY} />
        <circle r="30" fill={PALE} />
        <circle r="12" fill={ORANGE} />
      </g>
    </svg>
  );
}

export function CategoryIllustration({
  category,
}: {
  category: ProductCategory;
}) {
  switch (category) {
    case 'printing-machines':
      return <PrinterIllustration />;
    case 'toners-cartridges':
      return <TonerIllustration />;
    case 'consumables':
      return <ConsumableIllustration />;
    default:
      return <GearIllustration />;
  }
}

function isUsableUrl(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

export function SafeImage({
  src,
  alt,
  fallback,
  className,
}: {
  src: string | null;
  alt: string;
  fallback: ReactNode;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);
  if (!src || failed || !isUsableUrl(src)) return <>{fallback}</>;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

export function ProductImage({
  src,
  name,
  category,
}: {
  src: string | null;
  name: string;
  category: ProductCategory;
}) {
  return (
    <SafeImage
      src={src}
      alt={name}
      fallback={
        <div className="ph">
          <CategoryIllustration category={category} />
        </div>
      }
    />
  );
}
