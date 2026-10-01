'use client';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import type { ComponentProps, ReactNode } from 'react';
import React from 'react';

import { SupportEmail } from '@/components/ui/support-email';


interface FooterLink {
    title: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
    label: string;
    links: FooterLink[];
}

const footerLinks: FooterSection[] = [
    {
        label: 'Product',
        links: [
            { title: 'Features', href: '#features' },
            { title: 'Pricing', href: '#pricing' },
            { title: 'Testimonials', href: '#testimonials' },
        ],
    },
    {
        label: 'Company',
        links: [
            { title: 'FAQs', href: '#faq' },
            { title: 'About Us', href: '/about' },
            { title: 'Privacy Policy', href: '/privacy' },
            { title: 'Terms of Services', href: '/terms' },
        ],
    },
    {
        label: 'Social Links',
        links: [
            { title: 'YouTube', href: '#' },
            { title: 'TikTok', href: '#' },
            { title: 'Instagram', href: '#' },
            { title: 'Telegram', href: '#' },
        ],
    },
];

const SIDE_FADE = "linear-gradient(to bottom, black 15%, transparent 85%)";

export function Footer() {
    return (
        <footer id="contact" className="relative mx-auto mb-4 flex w-[calc(100%-2rem)] max-w-6xl flex-col items-center justify-center rounded-[2rem] bg-black bg-[radial-gradient(35%_128px_at_50%_0%,rgba(255,255,255,0.08),transparent)] px-6 py-12 md:mb-6 md:rounded-[3rem] lg:py-16">
            <div className="bg-foreground/20 absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur" />
            {/* Outline in the header's border colour: full along the top, the
                sides fade out downwards and there is no bottom edge. Drawn on
                its own layer so the fade doesn't touch the footer content. */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[inherit] border border-b-0 border-white/35"
                style={{ maskImage: SIDE_FADE, WebkitMaskImage: SIDE_FADE }}
            />

            <div className="grid w-full gap-8 xl:grid-cols-3 xl:gap-8">
                <AnimatedContainer className="space-y-4">
                    <Image
                        src="/logo_transparent.png"
                        alt="EntrixAlgo"
                        width={48}
                        height={48}
                        className="size-12 object-contain"
                    />
                    <p className="text-muted-foreground mt-8 text-sm md:mt-0">
                        © {new Date().getFullYear()} EntrixAlgo. All rights reserved.
                    </p>
                    {/* The landing's only support contact since the Connect block was removed */}
                    <p className="text-muted-foreground text-sm">
                        Need help with your account or billing? Email us at <SupportEmail />
                    </p>
                </AnimatedContainer>

                <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-8 xl:col-span-2 xl:mt-0">
                    {footerLinks.map((section, index) => (
                        <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
                            <div className="mb-10 md:mb-0">
                                <h3 className="text-xs">{section.label}</h3>
                                <ul className="text-muted-foreground mt-4 space-y-2 text-sm">
                                    {section.links.map((link) => (
                                        <li key={link.title}>
                                            <a
                                                href={link.href}
                                                className="hover:text-foreground inline-flex items-center transition-all duration-300"
                                            >
                                                {link.icon && <link.icon className="me-1 size-4" />}
                                                {link.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </AnimatedContainer>
                    ))}
                </div>
            </div>
        </footer>
    );
}

type ViewAnimationProps = {
    delay?: number;
    className?: ComponentProps<typeof motion.div>['className'];
    children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
        return <>{children}</>;
    }

    return (
        <motion.div
            initial={{ translateY: -8, opacity: 0 }}
            whileInView={{ translateY: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.8 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
