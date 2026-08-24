"use client";

import { MotionConfig } from "framer-motion";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // reducedMotion="user" makes every Framer Motion animation in the app
  // respect the OS-level prefers-reduced-motion setting automatically —
  // transform-based motion (translate/scale/rotate) is skipped for users
  // who've asked for it, without touching each animation individually.
  if (!mounted) {
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
  }

  return (
    <MotionConfig reducedMotion="user">
      <NextThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
      >
        {children}
      </NextThemeProvider>
    </MotionConfig>
  );
}
