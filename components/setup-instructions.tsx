"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react"

type EnvStatus = {
  hasGoogleClientId: boolean
  hasGoogleClientSecret: boolean
  hasGoogleCallbackUrl: boolean
  hasJwtSecret: boolean
  googleCallbackUrl: string
}

export function SetupInstructions({ envStatus }: { envStatus: EnvStatus }) {
  // Only state we actually need is isClient for hydration
  const [isClient, setIsClient] = useState(false)

  // Simple effect just for hydration detection
  useEffect(() => {
    setIsClient(true)
  }, [])

  // If not client-side yet, show a loading placeholder
  if (!isClient) {
    return <div className="animate-pulse h-64 bg-gray-100 rounded-md"></div>
  }

  // Derive all values directly in the render function
  const hostname = window.location.hostname
  const isV0 = hostname.includes("v0.dev") || hostname === "localhost" || hostname.includes(".lite.vusercontent.net")
  const currentUrl = window.location.origin

  // Derive callback URL information
  let callbackUrlOrigin = ""
  let showCallbackMismatch = false

  if (envStatus.googleCallbackUrl && !isV0) {
    try {
      callbackUrlOrigin = new URL(envStatus.googleCallbackUrl).origin
      showCallbackMismatch = callbackUrlOrigin !== currentUrl
    } catch (e) {
      // Invalid URL format
      showCallbackMismatch = true
    }
  }

  // Check if all environment variables are set
  const hasAllEnvVars =
    envStatus.hasGoogleClientId &&
    envStatus.hasGoogleClientSecret &&
    envStatus.hasGoogleCallbackUrl &&
    envStatus.hasJwtSecret

  // Check if setup is complete
  const isSetupComplete = !isV0 && hasAllEnvVars && !showCallbackMismatch

  // If setup is complete, show success message
  if (isSetupComplete) {
    return (
      <div className="w-full">
        <div className="rounded-lg border border-green-100 bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Setup complete</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Your Google authentication is properly configured and ready to use. You can now remove this component
                  from your application.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Setup Instructions</h2>

      {showCallbackMismatch && (
        <div className="mb-6 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2 px-4 py-2.5">
            <AlertTriangle className="h-4 w-4 text-neutral-600" />
            <p className="text-sm font-medium text-neutral-800">Callback URL Configuration Issue</p>
          </div>
          <div className="px-4 py-3 text-sm">
            <p className="mb-2 text-neutral-800">
              Your Google OAuth callback URL doesn't match your current domain. This will cause authentication to fail.
            </p>
            <div className="mb-3 space-y-1.5 rounded-md bg-white p-2.5 font-mono text-xs">
              <div>
                <span className="mr-2 text-gray-500 block">URL</span>
                <span className="font-semibold text-black mt-1">{currentUrl}</span>
              </div>
              <div>
                <span className="mr-2 text-gray-500 block">Callback</span>
                <span className="font-semibold text-red-500 mt-1">{envStatus.googleCallbackUrl}</span>
              </div>
            </div>
            <div className="space-y-2 text-neutral-800">
              <p>
                <strong>Solution:</strong> Update your environment variables in Vercel to use your production URL.
              </p>
              <p className="flex items-center gap-1.5">
                <a
                  href="https://vercel.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-800 hover:bg-neutral-200 transition-colors"
                >
                  Go to Vercel Dashboard
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 text-sm text-gray-600">
        <ol className="list-decimal pl-5 space-y-3">
          <li className={isV0 ? "" : "text-green-600 line-through"}>
            <div className="flex items-center gap-2">
              <strong>Fork and Deploy this Template:</strong>
              {!isV0 && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            </div>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Fork this template to your own v0 account</li>
              <li>Deploy it to Vercel to get your production URL</li>
              <li>
                Note your production URL (e.g.,{" "}
                <code className="bg-gray-100 px-1 rounded">https://your-app.vercel.app</code>)
              </li>
              <li>You&apos;ll need this URL for the Google OAuth configuration</li>
            </ul>
          </li>

          <li className={isV0 ? "opacity-50" : ""}>
            <div className="flex items-center gap-2">
              <strong>Create a Google Cloud Project:</strong>
              {!isV0 && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            </div>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>
                Go to the{" "}
                <a
                  href="https://console.cloud.google.com/"
                  target="_blank"
                  className="text-blue-600 hover:underline"
                  rel="noreferrer"
                >
                  Google Cloud Console
                </a>
              </li>
              <li>Create a new project or select an existing one</li>
              <li>Go to &quot;APIs &amp; Services&quot; {"->"} &quot;OAuth consent screen&quot;</li>
              <li>Select &quot;External&quot; user type (or &quot;Internal&quot; if applicable)</li>
              <li>Fill in the required app information (name, support email, etc.)</li>
              <li>
                Add scopes: <code className="bg-gray-100 px-1 rounded">.../auth/userinfo.email</code>,{" "}
                <code className="bg-gray-100 px-1 rounded">.../auth/userinfo.profile</code>, and{" "}
                <code className="bg-gray-100 px-1 rounded">openid</code>
              </li>
              <li>Add test users if in testing mode</li>
            </ul>
          </li>

          <li
            className={
              isV0
                ? "opacity-50"
                : envStatus.hasGoogleClientId && envStatus.hasGoogleClientSecret
                  ? "text-green-600"
                  : ""
            }
          >
            <div className="flex items-center gap-2">
              <strong>Create OAuth Credentials:</strong>
              {!isV0 && envStatus.hasGoogleClientId && envStatus.hasGoogleClientSecret && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
            </div>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Go to &quot;APIs &amp; Services&quot; {"->"} &quot;Credentials&quot;</li>
              <li>Click &quot;Create Credentials&quot; {"->"} &quot;OAuth client ID&quot;</li>
              <li>Select &quot;Web application&quot; as the application type</li>
              <li>
                Add{" "}
                <code className="bg-gray-100 px-1 rounded font-bold">
                  {isV0 ? "https://your-app.vercel.app" : currentUrl}
                </code>{" "}
                to &quot;Authorized JavaScript origins&quot;
              </li>
              <li>
                Add{" "}
                <code className="bg-gray-100 px-1 rounded font-bold">
                  {isV0 ? "https://your-app.vercel.app/api/auth/callback" : `${currentUrl}/api/auth/callback`}
                </code>{" "}
                to &quot;Authorized redirect URIs&quot;
              </li>
              <li>Click &quot;Create&quot; and note your Client ID and Client Secret</li>
            </ul>
          </li>

          <li className={isV0 ? "opacity-50" : hasAllEnvVars ? "text-green-600" : ""}>
            <div className="flex items-center gap-2">
              <strong>Set Environment Variables in Vercel:</strong>
              {!isV0 && hasAllEnvVars && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            </div>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Open your project in the Vercel dashboard</li>
              <li>Go to &quot;Settings&quot; {"->"} &quot;Environment Variables&quot;</li>
              <li>Add the following variables:</li>
              <li className={envStatus.hasGoogleClientId ? "text-green-600" : ""}>
                <code className="bg-gray-100 px-1 rounded">GOOGLE_CLIENT_ID</code>
                {envStatus.hasGoogleClientId ? <span className="ml-2">✓</span> : <span> Your OAuth client ID </span>}
              </li>
              <li className={envStatus.hasGoogleClientSecret ? "text-green-600" : ""}>
                <code className="bg-gray-100 px-1 rounded">GOOGLE_CLIENT_SECRET</code>
                {envStatus.hasGoogleClientSecret ? (
                  <span className="ml-2">✓</span>
                ) : (
                  <span> Your OAuth client secret </span>
                )}
              </li>
              <li className={envStatus.hasGoogleCallbackUrl ? "text-green-600" : ""}>
                <code className="bg-gray-100 px-1 rounded">GOOGLE_CALLBACK_URL</code>{" "}
                {envStatus.hasGoogleCallbackUrl ? (
                  <span className="ml-2">✓</span>
                ) : (
                  <code className="bg-gray-100 px-1 rounded font-bold">
                    {isV0 ? "https://your-app.vercel.app/api/auth/callback" : `${currentUrl}/api/auth/callback`}
                  </code>
                )}
              </li>
              <li className={envStatus.hasJwtSecret ? "text-green-600" : ""}>
                <code className="bg-gray-100 px-1 rounded">JWT_SECRET</code>: A secure random string for JWT signing
                {envStatus.hasJwtSecret && <span className="ml-2">✓</span>}
              </li>
              <li>Click &quot;Save&quot; and redeploy your application</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  )
}
