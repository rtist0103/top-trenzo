import type { Metadata } from "next";
import { ShieldCheck, Newspaper, Zap, Globe } from "lucide-react";
import { GoogleLoginButton } from "@/features/auth/components/google-login-button";

export const metadata: Metadata = {
  title: "Admin Login — Briefly",
  robots: { index: false, follow: false },
};

const features = [
  { icon: Newspaper, text: "Publish and manage articles" },
  { icon: Zap, text: "Real-time content updates" },
  { icon: Globe, text: "Multi-language support" },
];

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between relative overflow-hidden bg-zinc-950 p-14 text-white">

        {/* Background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04] bg-grid-pattern"
        />

        {/* Glow */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-125 w-125 rounded-full bg-primary/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-100 w-100 rounded-full bg-blue-500/10 blur-[100px]" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Newspaper className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">Briefly</span>
        </div>

        {/* Copy */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              Admin Dashboard
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              India&apos;s short-form<br />news platform.
            </h1>
            <p className="text-white/50 text-base leading-relaxed max-w-sm">
              Manage stories, categories, and editorial content from one powerful place.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/5 border border-white/10">
                  <Icon className="h-3.5 w-3.5 text-white/60" />
                </div>
                <span className="text-sm text-white/60">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-white/30 text-xs">
          © {new Date().getFullYear()} Briefly. All rights reserved.
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-background">

        {/* Mobile logo */}
        <div className="mb-10 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Newspaper className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Briefly</span>
        </div>

        <div className="w-full max-w-85 space-y-7">

          {/* Heading */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Admin Portal</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in with your authorised Google account.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border bg-card shadow-sm p-6 space-y-5">
            <GoogleLoginButton />

            <p className="text-center text-xs text-muted-foreground">
              By signing in you agree to our{" "}
              <span className="underline underline-offset-2 cursor-pointer">Terms of Service</span>
            </p>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-2.5 rounded-xl bg-muted/60 border px-3.5 py-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Access is restricted to authorised team members. Unauthorised attempts are logged.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}