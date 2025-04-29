export const runtime = "edge"

export async function GET() {
  try {
    // Check if API keys are configured
    const openaiKey = process.env.OPENAI_API_KEY || ""
    const deepseekKey = process.env.DEEPSEEK_API_KEY || ""

    // Simple validation of the API key formats
    const isValidOpenAIKey = openaiKey.startsWith("sk-") && openaiKey.length > 20
    const isValidDeepSeekKey = deepseekKey.length > 20

    // Log key information for debugging (without revealing the full key)
    console.log(
      "OpenAI API Key:",
      isValidOpenAIKey ? "Valid format" : "Invalid format",
      "Prefix:",
      openaiKey.substring(0, 5),
      "Length:",
      openaiKey.length,
    )
    console.log(
      "DeepSeek API Key:",
      isValidDeepSeekKey ? "Valid format" : "Invalid format",
      "Prefix:",
      deepseekKey.substring(0, 5),
      "Length:",
      deepseekKey.length,
    )

    const status = {
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        openai: isValidOpenAIKey ? "configured" : "missing_or_invalid",
        deepseek: isValidDeepSeekKey ? "configured" : "missing_or_invalid",
      },
      activeService: isValidOpenAIKey ? "openai" : isValidDeepSeekKey ? "deepseek" : "fallback",
      keyInfo: {
        openai: {
          prefix: openaiKey.substring(0, 3) + "...",
          length: openaiKey.length,
          valid: isValidOpenAIKey,
        },
        deepseek: {
          prefix: deepseekKey.substring(0, 3) + "...",
          length: deepseekKey.length,
          valid: isValidDeepSeekKey,
        },
      },
    }

    return new Response(JSON.stringify(status), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        status: "error",
        message: error.message || "Health check failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
