'use client'

import Link from 'next/link';
import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type StardustButtonSize = 'sm' | 'md' | 'default';

interface StardustButtonBaseProps {
  children?: React.ReactNode;
  className?: string;
  size?: StardustButtonSize;
  // Size used below 640px instead of `size` (phones)
  mobileSize?: StardustButtonSize;
}

type StardustButtonProps = StardustButtonBaseProps &
  (
    | ({ href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof StardustButtonBaseProps>)
    | ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof StardustButtonBaseProps>)
  );

// ─── Size tokens ──────────────────────────────────────────────────────────────

const sizeTokens: Record<StardustButtonSize, { fontSize: string; padding: string; gap: string }> = {
  sm:      { fontSize: '13px', padding: '9px 22px',  gap: '7px'  },
  md:      { fontSize: '15px', padding: '14px 28px', gap: '9px'  },
  default: { fontSize: '17px', padding: '16px 32px', gap: '10px' },
};

// ─── CSS injected once via React 19 style hoisting (href deduplicates) ────────
//
// em units in box-shadow are relative to the element's own font-size, so the
// glow scales proportionally at every size instead of using a fixed rem value.
//
const PEARL_CSS = `
  /* size: variables set inline per button; phones may swap to --pearl-*-m */
  .pearl-button { font-size: var(--pearl-fs); }
  .pearl-button .wrap { padding: var(--pearl-pad); }
  .pearl-button .wrap p { gap: var(--pearl-gap); }
  @media (max-width: 639px) {
    .pearl-button[data-mobile-size] { font-size: var(--pearl-fs-m); }
    .pearl-button[data-mobile-size] .wrap { padding: var(--pearl-pad-m); }
    .pearl-button[data-mobile-size] .wrap p { gap: var(--pearl-gap-m); }
  }

  /* wrap pseudo-elements: glass orb (::before) + top-edge highlight (::after) */
  .pearl-button .wrap::before,
  .pearl-button .wrap::after {
    content: "";
    position: absolute;
    pointer-events: none;
    transition: all 0.3s ease;
  }

  /* large light orb reflected from "above" the glass surface */
  .pearl-button .wrap::before {
    left: -15%;
    right: -15%;
    bottom: 25%;
    top: -100%;
    border-radius: 50%;
    background-color: rgba(64, 180, 255, 0.15);
  }

  /* top-edge specular highlight */
  .pearl-button .wrap::after {
    left: 6%;
    right: 6%;
    top: 12%;
    bottom: 40%;
    border-radius: 22px 22px 0 0;
    box-shadow: inset 0 10px 8px -10px rgba(129, 216, 255, 0.6);
    background: linear-gradient(
      180deg,
      rgba(64, 180, 255, 0.25) 0%,
      rgba(0, 0, 0, 0) 50%
    );
  }

  /* star swap: show ✧ at rest, swap to ✦ on hover */
  .pearl-button .wrap p span:nth-child(2) { display: none; }
  .pearl-button:hover .wrap p span:nth-child(1) { display: none; }
  .pearl-button:hover .wrap p span:nth-child(2) { display: inline-block; }

  /* hover: shift to blue-tinted glow */
  .pearl-button:hover {
    box-shadow:
      inset 0 0.3em 0.5em rgba(129, 216, 255, 0.4),
      inset 0 -0.1em 0.3em rgba(0, 0, 0, 0.7),
      inset 0 -0.4em 0.9em rgba(64, 180, 255, 0.6),
      0 3em 3em rgba(0, 0, 0, 0.3),
      0 1em 1em -0.6em rgba(0, 0, 0, 0.8);
  }

  .pearl-button:hover .wrap::before { transform: translateY(-5%); }
  .pearl-button:hover .wrap::after  { opacity: 0.4; transform: translateY(5%); }
  .pearl-button:hover .wrap p       { transform: translateY(-4%); }

  /* active: press-down translate + deeper shadow */
  .pearl-button:active {
    transform: translateY(4px);
    box-shadow:
      inset 0 0.3em 0.5em rgba(129, 216, 255, 0.5),
      inset 0 -0.1em 0.3em rgba(0, 0, 0, 0.8),
      inset 0 -0.4em 0.9em rgba(64, 180, 255, 0.4),
      0 3em 3em rgba(0, 0, 0, 0.3),
      0 1em 1em -0.6em rgba(0, 0, 0, 0.8);
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export const StardustButton = ({
  children = 'Get Access',
  className = '',
  size = 'default',
  mobileSize,
  ...props
}: StardustButtonProps) => {
  const { fontSize, padding, gap } = sizeTokens[size];
  const mobile = mobileSize ? sizeTokens[mobileSize] : null;

  // font-size is set on the outer element (via --pearl-fs, see PEARL_CSS) so
  // em units in box-shadow are correct at every size
  const buttonStyle: React.CSSProperties & Record<string, string | number> = {
    '--bg': '#0a1929',
    '--radius': '100px',
    '--pearl-fs': fontSize,
    '--pearl-pad': padding,
    '--pearl-gap': gap,
    ...(mobile && { '--pearl-fs-m': mobile.fontSize, '--pearl-pad-m': mobile.padding, '--pearl-gap-m': mobile.gap }),
    outline: 'none',
    cursor: 'pointer',
    border: 0,
    position: 'relative',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--bg)',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    textDecoration: 'none',
    display: 'inline-block',
    // em units → proportional glow at every size; reduced white opacity vs original
    boxShadow: `
      inset 0 0.3em 0.9em rgba(255, 255, 255, 0.22),
      inset 0 -0.1em 0.3em rgba(0, 0, 0, 0.7),
      inset 0 -0.4em 0.9em rgba(255, 255, 255, 0.32),
      0 3em 3em rgba(0, 0, 0, 0.3),
      0 1em 1em -0.6em rgba(0, 0, 0, 0.8)
    `,
  };

  const wrapStyle: React.CSSProperties = {
    fontWeight: 500,
    color: 'rgba(129, 216, 255, 0.9)',
    borderRadius: 'inherit',
    position: 'relative',
    overflow: 'hidden',
  };

  const pStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    margin: 0,
    transition: 'transform 0.2s ease',
    transform: 'translateY(2%)',
    maskImage: 'linear-gradient(to bottom, rgba(129, 216, 255, 1) 40%, transparent)',
    WebkitMaskImage: 'linear-gradient(to bottom, rgba(129, 216, 255, 1) 40%, transparent)',
  };

  // React 19: <style href precedence> is hoisted to <head> and deduplicated —
  // only one copy in the DOM regardless of how many buttons are on the page.
  const styleTag = (
    <style href="pearl-button-v2" precedence="default">
      {PEARL_CSS}
    </style>
  );

  const inner = (
    <div className="wrap" style={wrapStyle}>
      <p style={pStyle}>
        <span>✧</span>
        <span>✦</span>
        {children}
      </p>
    </div>
  );

  if ('href' in props && props.href !== undefined) {
    const { href, ...anchorProps } = props as { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <>
        {styleTag}
        <Link
          href={href}
          className={`pearl-button${className ? ` ${className}` : ''}`}
          style={buttonStyle as React.CSSProperties}
          data-mobile-size={mobileSize}
          {...(anchorProps as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>)}
        >
          {inner}
        </Link>
      </>
    );
  }

  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <>
      {styleTag}
      <button
        className={`pearl-button${className ? ` ${className}` : ''}`}
        style={buttonStyle as React.CSSProperties}
        data-mobile-size={mobileSize}
        {...buttonProps}
      >
        {inner}
      </button>
    </>
  );
};
