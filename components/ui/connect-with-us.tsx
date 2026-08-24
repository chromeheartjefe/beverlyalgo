'use client';

import Image from 'next/image';
import React, { useState } from 'react';

interface SocialIconProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  hoverBackground: string;
  hoverShadow: string;
}

function SocialIcon({ href, label, icon, hoverBackground, hoverShadow }: SocialIconProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      className="flex flex-col items-center gap-3 no-underline"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 backdrop-blur-sm transition-all duration-300 sm:h-20 sm:w-20"
        style={{
          background: hovered ? hoverBackground : 'rgba(255,255,255,0.05)',
          boxShadow: hovered ? hoverShadow : '0 8px 32px rgba(0,0,0,0.3)',
          transform: hovered ? 'translateY(-10px) scale(1.1)' : 'translateY(0) scale(1)',
        }}
      >
        <div style={{ animation: hovered ? 'shake 0.5s ease-in-out' : 'none' }}>
          {icon}
        </div>
      </div>
      <span
        className="text-xs font-medium text-white transition-all duration-300 sm:text-sm"
        style={{
          opacity: hovered ? 1 : 0.7,
          transform: hovered ? 'translateY(4px)' : 'translateY(0)',
        }}
      >
        {label}
      </span>
    </a>
  );
}

const socialIcons = [
  {
    href: '#',
    label: 'YouTube',
    hoverBackground: '#ff0000',
    hoverShadow: '0 0 20px rgba(255,0,0,0.6)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white sm:h-8 sm:w-8">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    href: '#',
    label: 'TikTok',
    hoverBackground: '#010101',
    hoverShadow: '0 0 20px rgba(105,201,208,0.6)',
    icon: (
      <Image src="/tiktok_logo.png" alt="TikTok" width={32} height={32} className="h-6 w-6 object-contain sm:h-8 sm:w-8" />
    ),
  },
  {
    href: '#',
    label: 'Instagram',
    hoverBackground: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    hoverShadow: '0 0 20px rgba(220,39,67,0.6)',
    icon: (
      <Image src="/instagram_logo.png" alt="Instagram" width={32} height={32} className="h-6 w-6 object-contain sm:h-8 sm:w-8" />
    ),
  },
  {
    href: '#',
    label: 'Telegram',
    hoverBackground: '#229ed9',
    hoverShadow: '0 0 20px rgba(34,158,217,0.6)',
    icon: (
      <Image src="/telegram_logo.png" alt="Telegram" width={32} height={32} className="h-6 w-6 object-contain sm:h-8 sm:w-8" />
    ),
  },
];

export function SocialConnect() {
  return (
    <section className="px-4 py-12 sm:py-24 md:py-32">
      <div className="max-w-container mx-auto flex flex-col items-center gap-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold sm:text-5xl">
            Connect{' '}
            <span className="bg-gradient-to-r from-purple-400 via-purple-400 to-red-400 bg-clip-text text-transparent">
              With Us
            </span>
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-[480px] text-balance text-sm sm:text-base">
            Join our community and stay updated with the latest news, releases, and exclusive content
          </p>
        </div>

        <div
          className="w-full max-w-2xl rounded-3xl border border-white/10 p-5 backdrop-blur-3xl transition-all duration-500 hover:scale-[1.02] sm:p-8"
          style={{
            background: '#242424',
            boxShadow: '0 0 40px rgba(139,92,246,0.35), 0 0 70px rgba(124,58,237,0.18)',
          }}
        >
          <div className="flex flex-nowrap justify-center gap-3 sm:flex-wrap sm:gap-8">
            {socialIcons.map((item) => (
              <SocialIcon key={item.label} {...item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
