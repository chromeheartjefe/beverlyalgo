"use server"

import { revalidatePath } from "next/cache"

import { clearCache } from "~/lib/ttl-cache"

/** Drops the cached Stripe data so the next render fetches it fresh */
export async function refreshData(): Promise<void> {
  clearCache()
  revalidatePath("/", "layout")
}
