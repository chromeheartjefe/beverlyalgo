import "./globals.css"

import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import type { ReactNode } from "react"

import { Nav } from "~/components/nav"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-num", display: "swap" })

export const metadata: Metadata = {
  title: "EntrixAlgo Admin",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen">
        <div className="page-glow" aria-hidden />
        <div className="flex min-h-screen">
          <Nav />
          <main className="min-w-0 flex-1 px-5 py-6 lg:px-10 lg:py-8">
            <div className="mx-auto max-w-[1440px]">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
