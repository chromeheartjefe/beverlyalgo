"use client"

import { useSession } from "next-auth/react"
import useSWR from "swr"

import type { FreeAnalysisState } from "@/lib/free-analysis"
import { fetcher } from "@/lib/swr"

const FREE_ANALYSIS_KEY = "/api/analyze/free"

/**
 * A Free account's one free Chart Analysis (see lib/free-analysis.ts).
 * `state` is undefined while loading and for signed-out or Pro users; one
 * SWR key, so the sidebar, Overview and Chart Analysis page share one fetch.
 */
export function useFreeAnalysis() {
  const { data: session, status } = useSession()
  const plan = (session?.user as { plan?: string } | undefined)?.plan ?? "free"
  const isFree = status === "authenticated" && plan === "free"
  const { data, mutate } = useSWR<{ state: FreeAnalysisState }>(isFree ? FREE_ANALYSIS_KEY : null, fetcher)
  return {
    isFree,
    state: isFree ? data?.state : undefined,
    setState: (state: FreeAnalysisState) => mutate({ state }, { revalidate: false }),
    refresh: () => mutate(),
  }
}
