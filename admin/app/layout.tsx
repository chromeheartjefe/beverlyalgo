import "./globals.css"

import type { Metadata } from "next"
import type { ReactNode } from "react"

import { Nav } from "~/components/nav"

export const metadata: Metadata = {
  title: "EntrixAlgo Admin",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="flex min-h-screen">
          <Nav />
          <main className="min-w-0 flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </body>
    </html>
  )
}
