import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import type { Message } from "ai"
import { callDeepSeekAPI } from "@/lib/deepseek"
import { getSystemPrompt } from "@/lib/ai-models"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { messages, model = "gpt-4o" } = (await req.json()) as {
      messages: Message[]
      model: string
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid or empty messages array" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const systemPrompt = getSystemPrompt(model)

    // Handle DeepSeek models
    if (model === "deepseek-coder") {
      try {
        const response = await callDeepSeekAPI(messages, systemPrompt)
        return response
      } catch (error: any) {
        console.error("DeepSeek API error:", error)
        return new Response(
          JSON.stringify({
            error: "DeepSeek API error",
            message: error.message || "Unknown error with DeepSeek API",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        )
      }
    }

    // Handle OpenAI models with AI SDK
    try {
      const result = streamText({
        model: openai(model),
        messages,
        system: systemPrompt,
      })

      return result.toDataStreamResponse()
    } catch (error: any) {
      console.error("OpenAI API error:", error)
      return new Response(
        JSON.stringify({
          error: "OpenAI API error",
          message: error.message || "Unknown error with OpenAI API",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }
  } catch (error: any) {
    console.error("General API error:", error)
    return new Response(
      JSON.stringify({
        error: "API error",
        message: error.message || "Unknown error processing request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
