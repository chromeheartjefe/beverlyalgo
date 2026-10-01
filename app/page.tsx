import dynamic from "next/dynamic";

import { HeroSection } from "../components/ui/hero-section-1";

// Everything below the hero is off-screen on first paint — code-split it into
// its own chunks so the initial bundle only has to parse/hydrate the hero.
// SSR stays on (default) so content, SEO, and anchor links (#pricing, #faq,
// ...) are unaffected — this only defers *client JS* loading, not markup.
const AiChartAnalyserPreview = dynamic(() => import("../components/ui/ai-chart-analyser-preview").then((m) => m.AiChartAnalyserPreview));
const AiChatbotPreview       = dynamic(() => import("../components/ui/ai-chatbot-preview").then((m) => m.AiChatbotPreview));
const AiIndicatorPreview     = dynamic(() => import("../components/ui/ai-indicator-preview").then((m) => m.AiIndicatorPreview));
const AiScreenerPreview      = dynamic(() => import("../components/ui/ai-screener-preview").then((m) => m.AiScreenerPreview));
const FeaturesGrid           = dynamic(() => import("../components/ui/features-grid").then((m) => m.FeaturesGrid));
const Logos                  = dynamic(() => import("../components/sections/logos/default"));
const Testimonials           = dynamic(() => import("../components/sections/testimonials/default"));
const QuickStartGuide        = dynamic(() => import("../components/sections/quick-start/default"));
const Pricing                = dynamic(() => import("../components/sections/pricing/default"));
const FAQ                    = dynamic(() => import("../components/sections/faq/default"));
const Footer                 = dynamic(() => import("../components/ui/footer-section").then((m) => m.Footer));
const BackgroundGradientAnimation = dynamic(() => import("../components/ui/background-gradient-animation").then((m) => m.BackgroundGradientAnimation));
const BackToTop              = dynamic(() => import("../components/ui/back-to-top").then((m) => m.BackToTop));

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen w-full">
      {/* Hero — grid + gradient visible */}
      <HeroSection />

      {/* AI Chart Analyser preview — animated loop until real gif/video is ready */}
      <AiChartAnalyserPreview />

      {/* AI Trading Assistant preview — animated looped chat demo */}
      <AiChatbotPreview />

      {/* AI Trading Indicator preview — mini looped candle chart with buy/sell signals */}
      <AiIndicatorPreview />

      {/* AI Screener preview — radar scan into ranked crypto/stock picks */}
      <AiScreenerPreview />

      <div id="features">
        <FeaturesGrid />
      </div>

      <div id="results">
        <Logos />
      </div>

      <div>
        <QuickStartGuide />
      </div>

      <div id="testimonials">
        <Testimonials />
      </div>

      <div id="pricing" className="line-b">
        <Pricing />
      </div>

      {/* FAQ and footer share one background, so there is no seam between them */}
      <div className="relative overflow-hidden bg-black">
        <BackgroundGradientAnimation variant="corners" size="50%" containerClassName="absolute inset-0 z-0" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-32 bg-gradient-to-b from-black via-black/60 to-transparent"
        />
        <div className="relative z-[3]">
          <div id="faq">
            <FAQ bare />
          </div>
          <Footer />
        </div>
      </div>

      <BackToTop />
    </main>
  );
}
