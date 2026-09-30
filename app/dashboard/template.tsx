import { PageFade } from "@/components/dashboard/page-fade"

// Remounted by Next.js on every dashboard navigation (unlike layout.tsx), so
// each tab switch gets PageFade's short fade-in.
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <PageFade>{children}</PageFade>
}
