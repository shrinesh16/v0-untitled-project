export async function GET() {
  try {
    // Check if environment variables are set
    const openaiKey = process.env.OPENAI_API_KEY
    const deepseekKey = process.env.DEEPSEEK_API_KEY

    const status = {
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        openai: !!openaiKey ? "configured" : "missing",
        deepseek: !!deepseekKey ? "configured" : "missing",
      },
    }

    return new Response(JSON.stringify(status), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ status: "error", message: "Health check failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
