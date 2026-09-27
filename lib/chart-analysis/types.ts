export type ChartAnalysisVariantId = "v1-aggressive" | "v2"

export type ChartAnalysisVariant = {
  id:                  ChartAnalysisVariantId
  label:               string
  model:               string
  /** "high" keeps tightly packed Y-axis labels readable (sub-$1 prices) */
  imageDetail:         "low" | "high" | "auto"
  maxCompletionTokens: number
  /** Must contain the word "json" (required by response_format json_object) */
  system:              string
  /**
   * Server-side post-processing of the model's parsed JSON (already checked
   * for validation errors). Turns the model's raw read into the response the
   * UI renders. Variants without it pass the model output through as-is.
   */
  finalize?:           (raw: Record<string, unknown>) => Record<string, unknown>
}
