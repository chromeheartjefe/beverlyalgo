import Stripe from "stripe"

import { requireEnv } from "@/lib/env"

export const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"))
