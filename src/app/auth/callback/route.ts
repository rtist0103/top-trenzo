import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Return a page that closes the popup — the opener polls for popup.closed
  // and then navigates to /admin itself
  return new NextResponse(
    `<!DOCTYPE html>
<html>
  <head><title>Signing in…</title></head>
  <body>
    <script>
      // If opened as a popup, close it so the opener can detect completion
      if (window.opener && !window.opener.closed) {
        window.close();
      } else {
        // Opened as a full redirect (popup was blocked) — go to admin
        window.location.href = "/admin";
      }
    </script>
  </body>
</html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html" },
    },
  );
}