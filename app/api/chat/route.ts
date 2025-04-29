import { StreamingTextResponse } from "ai"
import OpenAI from "openai"
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

  console.log("Calling DeepSeek API with messages:", JSON.stringify(deepseekMessages.slice(0, 1)))

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
    const errorText = await response.text()
    console.error(`DeepSeek API error: ${response.status} ${errorText}`)
    throw new Error(`DeepSeek API error: ${response.status} ${errorText}`)
  }

  return response
}

// Function to create a mock response stream
function createMockResponseStream(prompt: string) {
  const mockResponse = generateMockResponse(prompt)

  return new ReadableStream({
    async start(controller) {
      // Split the response into smaller chunks to simulate streaming
      const chunks = mockResponse.match(/.{1,20}/g) || []

      for (const chunk of chunks) {
        controller.enqueue(new TextEncoder().encode(chunk))
        // Add a small delay to simulate streaming
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      controller.close()
    },
  })
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
    const { messages, model } = body || {}
    const modelChoice = typeof model === "string" ? model : "openai"

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Invalid messages format:", messages)
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get the last user message for fallback mode
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")
    const userPrompt = lastUserMessage?.content || ""

    // Validate each message has the required properties
    const validatedMessages = messages.map((message) => {
      // Ensure role is a string and is one of the allowed values
      const role = typeof message.role === "string" ? message.role : "user"

      // Ensure content is a string
      const content = typeof message.content === "string" ? message.content : ""

      return { role, content }
    })

    // System prompt for code optimization
    const systemPrompt = `You are CodeOptimizer, an AI assistant specialized in optimizing and fixing code.
    - Analyze code for inefficiencies, bugs, and potential improvements
    - Suggest better algorithms, data structures, and patterns
    - Explain your reasoning clearly and concisely
    - Provide optimized code examples when appropriate
    - Focus on best practices and modern coding standards
    - Be specific about performance improvements`

    // Add system message for code optimization
    const systemMessage = {
      role: "system",
      content: systemPrompt,
    }

    let apiError = null

    // Use the selected model (default to OpenAI)
    if (modelChoice === "deepseek") {
      try {
        console.log("Using DeepSeek API")
        const response = await callDeepSeekAPI(validatedMessages, systemPrompt)

        // Create a transformed stream for DeepSeek
        const transformedStream = new ReadableStream({
          async start(controller) {
            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            if (!reader) {
              controller.error(new Error("Response body is null"))
              return
            }

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
                        controller.enqueue(new TextEncoder().encode(text))
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

        return new StreamingTextResponse(transformedStream)
      } catch (error: any) {
        console.error("DeepSeek API error:", error)
        apiError = `DeepSeek API error: ${error.message}`

        // Fall through to fallback mode
      }
    } else {
      // Use OpenAI
      try {
        console.log("Using OpenAI API")

        // Check if OpenAI API key is available
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
          throw new Error("OpenAI API key is not configured")
        }

        console.log(
          "OpenAI API Key format check:",
          apiKey.startsWith("sk-") ? "Valid prefix" : "Invalid prefix",
          "Length:",
          apiKey.length,
        )

        // Create an OpenAI client
        const openai = new OpenAI({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true,
        })

        // Call OpenAI API with simplified request
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt },
              ...validatedMessages.map((m) => ({
                role: m.role as any,
                content: m.content,
              })),
            ],
            stream: true,
          })

          // Return the streaming response
          return new StreamingTextResponse(completion)
        } catch (openaiError: any) {
          console.error("OpenAI completion error:", openaiError)
          throw new Error(`OpenAI completion error: ${openaiError.message}`)
        }
      } catch (error: any) {
        console.error("OpenAI API error:", error)
        apiError = `OpenAI API error: ${error.message}`

        // Try DeepSeek as fallback if not already tried
        if (modelChoice !== "deepseek") {
          try {
            console.log("OpenAI API failed, falling back to DeepSeek")
            const response = await callDeepSeekAPI(validatedMessages, systemPrompt)

            // Create a transformed stream for DeepSeek
            const transformedStream = new ReadableStream({
              async start(controller) {
                const reader = response.body?.getReader()
                const decoder = new TextDecoder()

                if (!reader) {
                  controller.error(new Error("Response body is null"))
                  return
                }

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
                            controller.enqueue(new TextEncoder().encode(text))
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

            return new StreamingTextResponse(transformedStream)
          } catch (deepseekError: any) {
            console.error("DeepSeek API error (fallback):", deepseekError)
            apiError = `Both APIs failed. OpenAI: ${error.message}, DeepSeek: ${deepseekError.message}`
          }
        }
      }
    }

    // If we reach here, both APIs have failed
    console.log("Both APIs failed, using fallback mode with mock response")

    // Create a mock response stream as a last resort
    const mockStream = createMockResponseStream(userPrompt)
    return new StreamingTextResponse(mockStream)
  } catch (error: any) {
    console.error("API route error:", error)

    // Return a more detailed error response
    return new Response(
      JSON.stringify({
        error: "Error processing your request",
        details: error.message || "Unknown error",
        stack: error.stack || "No stack trace available",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
