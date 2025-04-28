import type { Message } from "ai"

interface DeepSeekMessage {
  role: "user" | "assistant" | "system"
  content: string
}

interface DeepSeekCompletionRequest {
  model: string
  messages: DeepSeekMessage[]
  stream: boolean
  temperature?: number
  max_tokens?: number
}

// This function transforms the DeepSeek API response format to match the AI SDK's expected format
const transformStream = (response: Response) => {
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  return new ReadableStream({
    async start(controller) {
      if (!reader) return controller.close()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n").filter((line) => line.trim() !== "")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const json = JSON.parse(data)
                const text = json.choices?.[0]?.delta?.content || ""

                if (text) {
                  // Format to match AI SDK's expected format
                  const aiSdkChunk = {
                    type: "text",
                    text,
                  }

                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(aiSdkChunk)}\n\n`))
                }
              } catch (e) {
                console.error("Error parsing DeepSeek chunk:", e)
              }
            }
          }
        }

        controller.close()
      } catch (e) {
        controller.error(e)
      }
    },
  })
}

export async function callDeepSeekAPI(messages: Message[], systemPrompt: string): Promise<Response> {
  const apiKey = process.env.DEEPSEEK_API_KEY

  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured")
  }

  // Convert AI SDK messages to DeepSeek format
  const deepseekMessages: DeepSeekMessage[] = []

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
        content: message.content as string,
      })
    }
  })

  const payload: DeepSeekCompletionRequest = {
    model: "deepseek-coder",
    messages: deepseekMessages,
    stream: true,
    temperature: 0.7,
    max_tokens: 4096,
  }

  // Call DeepSeek API
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`DeepSeek API error: ${response.status} ${errorText}`)
  }

  // Transform the stream to match AI SDK's format
  const transformedStream = transformStream(response)

  return new Response(transformedStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
