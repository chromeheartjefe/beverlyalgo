import type { Metadata } from "next"

import { AnnouncementBanner } from "@/components/dashboard/announcement-banner"
import { MobileNavProvider } from "@/components/dashboard/mobile-nav-context"
import { SessionGuard } from "@/components/dashboard/session-guard"
import { SessionLoadingScreen } from "@/components/dashboard/session-loading-screen"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/top-header"
import { VerifyBanner } from "@/components/dashboard/verify-banner"
import { WhatsNewProvider } from "@/components/dashboard/whats-new"
import { SkipLink } from "@/components/ui/skip-link"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your EntrixAlgo AI trading intelligence dashboard.",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileNavProvider>
      <WhatsNewProvider>
        {/* Only here: the sidebar and header are the one long run of links
            before the content. Other pages start with their content. */}
        <SkipLink />
        <div className="flex h-dvh overflow-hidden bg-[#09090f] text-white">
          <DashboardSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <DashboardHeader />
            <VerifyBanner />
            <AnnouncementBanner />
            <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto focus:outline-none">
              {children}
            </main>
          </div>
        </div>
        <SessionLoadingScreen />
        <SessionGuard />
      </WhatsNewProvider>
    </MobileNavProvider>
  )
}
