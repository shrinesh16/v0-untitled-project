export const runtime = "edge"

export async function GET() {
  try {
    const status = {
      status: "limited",
      timestamp: new Date().toISOString(),
      services: {
        openai: "quota_exceeded",
        deepseek: "insufficient_balance",
      },
      activeService: "demo",
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
