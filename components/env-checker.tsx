"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function EnvChecker() {
  const [apiStatus, setApiStatus] = useState<{
    openai: "checking" | "missing" | "invalid" | "configured"
    deepseek: "checking" | "missing" | "invalid" | "configured"
  }>({
    openai: "checking",
    deepseek: "checking",
  })

  useEffect(() => {
    const checkApiKeys = async () => {
      try {
        const response = await fetch("/api/health")

        if (!response.ok) {
          setApiStatus({
            openai: "missing",
            deepseek: "missing",
          })
          return
        }

        const data = await response.json()

        // More detailed status checking
        setApiStatus({
          openai:
            data.services?.openai === "configured"
              ? "configured"
              : data.keyInfo?.openai?.length > 0
                ? "invalid"
                : "missing",
          deepseek:
            data.services?.deepseek === "configured"
              ? "configured"
              : data.keyInfo?.deepseek?.length > 0
                ? "invalid"
                : "missing",
        })

        // Log key info for debugging
        console.log("API Key Info:", data.keyInfo)
      } catch (error) {
        console.error("Error checking API keys:", error)
        setApiStatus({
          openai: "missing",
          deepseek: "missing",
        })
      }
    }

    checkApiKeys()
  }, [])

  if (apiStatus.openai === "checking" && apiStatus.deepseek === "checking") return null
  if (apiStatus.openai === "configured" || apiStatus.deepseek === "configured") return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>API Keys Issue</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <p>There are issues with your API keys:</p>
          <ul className="list-disc pl-5">
            {apiStatus.openai !== "configured" && (
              <li>
                OpenAI API key is {apiStatus.openai === "missing" ? "missing" : "invalid"}.
                {apiStatus.openai === "invalid" && " The key format appears to be incorrect."}
              </li>
            )}
            {apiStatus.deepseek !== "configured" && (
              <li>
                DeepSeek API key is {apiStatus.deepseek === "missing" ? "missing" : "invalid"}.
                {apiStatus.deepseek === "invalid" && " The key format appears to be incorrect."}
              </li>
            )}
          </ul>
          <p className="mt-2">
            Please check your environment variables and ensure the API keys are correctly formatted.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  )
}
