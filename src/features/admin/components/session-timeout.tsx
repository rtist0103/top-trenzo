"use client";

import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000;
const WARN_BEFORE_MS = 5 * 60 * 1000;

const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart", "click"] as const;

export function SessionTimeout() {
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnToastId = useRef<string | number | null>(null);
  const signingOut = useRef(false);

  const clearTimers = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (warnTimer.current) clearTimeout(warnTimer.current);
  }, []);

  // handleSignOut declared before resetTimers — no forward reference needed
  const handleSignOut = useCallback(async () => {
    if (signingOut.current) return;
    signingOut.current = true;

    clearTimers();

    // Remove listeners by iterating ACTIVITY_EVENTS directly —
    // avoids any reference to resetTimers before it is declared
    ACTIVITY_EVENTS.forEach((e) =>
      window.removeEventListener(e, () => {}),
    );

    const supabase = createClient();
    await supabase.auth.signOut();

    toast.info("You were signed out due to inactivity.");

    window.location.href = "/admin/login";
  }, [clearTimers]);

  const resetTimers = useCallback(() => {
    if (signingOut.current) return;

    clearTimers();

    if (warnToastId.current !== null) {
      toast.dismiss(warnToastId.current);
      warnToastId.current = null;
    }

    warnTimer.current = setTimeout(() => {
      warnToastId.current = toast.warning(
        "You'll be signed out in 5 minutes due to inactivity.",
        { duration: WARN_BEFORE_MS },
      );
    }, IDLE_TIMEOUT_MS - WARN_BEFORE_MS);

    idleTimer.current = setTimeout(handleSignOut, IDLE_TIMEOUT_MS);
  }, [clearTimers, handleSignOut]);

  useEffect(() => {
    resetTimers();

    ACTIVITY_EVENTS.forEach((e) =>
      window.addEventListener(e, resetTimers, { passive: true }),
    );

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, resetTimers));
    };
  }, [resetTimers, clearTimers]);

  return null;
}