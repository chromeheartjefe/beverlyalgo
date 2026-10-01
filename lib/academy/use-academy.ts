"use client"

import useSWR from "swr"

import type { AcademyState } from "@/lib/academy/server"
import { localDay } from "@/lib/academy/xp"
import { fetcher } from "@/lib/swr"

export function academyKey(): string {
  return `/api/academy?day=${localDay()}`
}

/** XP, streak and finished lessons for the signed-in learner */
export function useAcademy() {
  const { data, error, isLoading, mutate } = useSWR<AcademyState>(academyKey(), fetcher, {
    revalidateOnFocus: false,
  })
  return { state: data, error, loading: isLoading, mutate }
}
