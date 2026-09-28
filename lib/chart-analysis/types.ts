export type ChartAnalysisVariantId = "v1-aggressive" | "v2"

export type ChartAnalysisVariant = {
  id:                  ChartAnalysisVariantId
  label:               string
  model:               string
  /** "high" keeps tightly packed Y-axis labels readable (sub-$1 prices) */
  imageDetail:         "low" | "high" | "auto"
  /**
   * Hidden reasoning tokens count against this cap before any visible
   * output, so it has to cover both. gpt-6-luna reasons far more than
   * gpt-5.6-luna did at its default effort ("medium").
   */
  maxCompletionTokens: number
  /** Always set explicitly, with a cap sized for it (medium needs ~8000 on gpt-6-luna) */
  reasoningEffort:     "none" | "low" | "medium" | "high"
  /** Must contain the word "json" (required by response_format json_object) */
  system:              string
  /**
   * Server-side post-processing of the model's parsed JSON (already checked
   * for validation errors). Turns the model's raw read into the response the
   * UI renders. Variants without it pass the model output through as-is.
   */
  finalize?:           (raw: Record<string, unknown>) => Record<string, unknown>
}
