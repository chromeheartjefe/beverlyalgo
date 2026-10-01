import { ImageResponse } from "next/og"

import { LESSON_CONTENT } from "@/content/academy"
import { formatIssued } from "@/lib/academy/certificate"
import { getCertificate } from "@/lib/academy/exam"

// GET /api/certificate/:id/image: the certificate as a 1200x630 PNG, used for
// social previews and the "Download image" button. Public, like the page.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cert = await getCertificate(id)
  if (!cert) return new Response("Not found", { status: 404 })
  const lessons = Object.keys(LESSON_CONTENT).length

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1030 0%, #0b0b13 55%, #241a08 100%)",
          padding: 40,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid rgba(251,191,36,0.55)",
            color: "#ffffff",
            padding: "40px 60px",
          }}
        >
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>
            Entrix<span style={{ color: "#c084fc" }}>Algo</span>
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 20, letterSpacing: 8, color: "#fcd34d" }}>ENTRIX ACADEMY</div>
          <div style={{ display: "flex", marginTop: 8, fontSize: 22, color: "#9ca3af" }}>Certificate of completion</div>
          <div style={{ display: "flex", marginTop: 30, fontSize: 64, fontWeight: 700, textAlign: "center" }}>{cert.name}</div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 24, color: "#d1d5db", textAlign: "center", maxWidth: 900 }}>
            {`Completed all ${lessons} lessons and passed the final exam with ${cert.correct}/${cert.total}`}
          </div>
          <div style={{ display: "flex", marginTop: 36, gap: 60, fontSize: 20, color: "#9ca3af" }}>
            <span>{formatIssued(cert.issuedAt)}</span>
            <span>{`ID ${cert.id}`}</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      // Certificates never change: let browsers and the CDN keep the image
      // instead of re-rendering it for every social preview bot
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800" },
    },
  )
}
