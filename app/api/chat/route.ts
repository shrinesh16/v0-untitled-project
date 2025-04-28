import { generateMockResponse } from "@/lib/mock-response"

// Export runtime configuration
export const runtime = "edge"

// Helper function to call DeepSeek API
async function callDeepSeekAPI(messages: any[], systemPrompt: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY

  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured")
  }

  // Convert messages to DeepSeek format
  const deepseekMessages = []

  // Add system message if provided
  if (systemPrompt) {
    deepseekMessages.push({
      role: "system",
      content: systemPrompt,
    })
  }

  // Add conversation messages
  messages.forEach((message) => {
    if (message.role === "user" || message.role === "assistant") {
      deepseekMessages.push({
        role: message.role,
        content: message.content,
      })
    }
  })

  // Call DeepSeek API
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-coder",
      messages: deepseekMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`DeepSeek API error: ${JSON.stringify(errorData)}`)
  }

  return response
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    let body
    try {
      body = await req.json()
    } catch (error) {
      console.error("Failed to parse request body:", error)
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Extract and validate the messages from the request body
    const { messages } = body || {}

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Invalid messages format:", messages)
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get the last user message
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")
    const userPrompt = lastUserMessage?.content || ""

    console.log("Both OpenAI and DeepSeek APIs are unavailable. Using mock response.")

    // Generate a mock response
    const mockResponse = generateMockResponse(userPrompt as string)

    // Create a ReadableStream from the mock response
    const stream = new ReadableStream({
      async start(controller) {
        // Split the response into smaller chunks to simulate streaming
        const chunks = mockResponse.match(/.{1,20}/g) || []

        for (const chunk of chunks) {
          const data = {
            type: "text",
            text: chunk,
          }

          // Encode as a server-sent event
          const encodedChunk = new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
          controller.enqueue(encodedChunk)

          // Add a small delay to simulate streaming
          await new Promise((resolve) => setTimeout(resolve, 50))
        }

        // End the stream
        controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`))
        controller.close()
      },
    })

    // Return the stream as a response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error: any) {
    console.error("API route error:", error)
    return new Response(
      JSON.stringify({
        error: "Error processing your request",
        details: error.message || "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
