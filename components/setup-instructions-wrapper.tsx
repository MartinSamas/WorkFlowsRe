import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, JWT_SECRET } from "@/lib/constants"
import { SetupInstructions } from "./setup-instructions"

export function SetupInstructionsWrapper() {
  // Check for the existence of environment variables
  const envStatus = {
    hasGoogleClientId: !!GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!GOOGLE_CLIENT_SECRET,
    hasGoogleCallbackUrl: !!GOOGLE_CALLBACK_URL,
    hasJwtSecret: !!JWT_SECRET,
    googleCallbackUrl: GOOGLE_CALLBACK_URL || "",
  }

  // Pass the environment status to the client component
  return <SetupInstructions envStatus={envStatus} />
}
