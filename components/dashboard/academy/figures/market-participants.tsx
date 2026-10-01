"use client"

import { motion } from "framer-motion"
import { Cpu, Landmark, type LucideIcon, Scale, Shield, User, Users } from "lucide-react"

import { EASE_OUT } from "@/components/ui/motion"

// Lesson figure: who can be on the other side of your trade.
const PARTICIPANTS: { name: string; icon: LucideIcon; role: string }[] = [
  { name: "Retail traders", icon: User, role: "Individuals trading their own money" },
  { name: "Institutions", icon: Users, role: "Funds and banks moving huge size" },
  { name: "Market makers", icon: Scale, role: "Quote both sides, earn the spread" },
  { name: "Algorithms and HFT", icon: Cpu, role: "Programs trading in microseconds" },
  { name: "Hedgers", icon: Shield, role: "Businesses reducing their risk" },
  { name: "Central banks", icon: Landmark, role: "Set rates, can move everything" },
]

export default function MarketParticipantsFigure() {
  return (
    <div className="relative border border-white/10 bg-white/[0.02] p-4 sm:p-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="mx-auto mb-4 w-fit rounded-full border border-purple-400/40 bg-purple-500/15 px-4 py-1.5 text-xs font-semibold text-purple-200"
      >
        Your order meets one of these
      </motion.div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {PARTICIPANTS.map(({ name, icon: Icon, role }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 + i * 0.07, ease: EASE_OUT }}
            className="flex items-start gap-2.5 border border-white/10 bg-[#0b0b13] p-3"
          >
            <Icon className="mt-0.5 size-4 shrink-0 text-purple-300" aria-hidden />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white">{name}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-gray-500">{role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
