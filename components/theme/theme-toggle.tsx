"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ThemeMode = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "archistra-theme-mode";
const CYCLE_ORDER: ThemeMode[] = ["system", "light", "dark"];

function normalizeMode(value: string | null | undefined): ThemeMode {
  if (value === "light" || value === "dark" || value === "system") return value;
  return "system";
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "light" || mode === "dark") return mode;
  if (typeof window.matchMedia !== "function") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredMode(): ThemeMode {
  try {
    return normalizeMode(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return "system";
  }
}

function applyTheme(mode: ThemeMode, persist: boolean, emit: boolean) {
  const resolved = resolveTheme(mode);
  const root = document.documentElement;
  root.dataset.themeMode = mode;
  root.dataset.theme = resolved;

  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore storage failures.
    }
  }

  if (emit) {
    window.dispatchEvent(
      new CustomEvent("archistra:theme-change", {
        detail: { mode, resolved }
      })
    );
  }

  return { mode, resolved };
}

export function ThemeToggle({ className }: { className?: string }) {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("dark");
  const modeRef = useRef<ThemeMode>("system");

  useEffect(() => {
    const initialMode = normalizeMode(
      document.documentElement.dataset.themeMode || readStoredMode()
    );
    const initialState = applyTheme(initialMode, false, false);
    modeRef.current = initialState.mode;
    setMode(initialState.mode);
    setResolved(initialState.resolved);

    const onThemeChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ mode?: ThemeMode; resolved?: ResolvedTheme }>;
      const detailMode = normalizeMode(customEvent.detail?.mode);
      const detailResolved = customEvent.detail?.resolved;

      modeRef.current = detailMode;
      setMode(detailMode);
      setResolved(detailResolved === "light" || detailResolved === "dark" ? detailResolved : resolveTheme(detailMode));
    };

    const onStorageChanged = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        const externalMode = normalizeMode(event.newValue);
        const state = applyTheme(externalMode, false, true);
        modeRef.current = state.mode;
        setMode(state.mode);
        setResolved(state.resolved);
      }
    };

    const mediaQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;
    const onSystemChanged = () => {
      if (modeRef.current === "system") {
        const state = applyTheme("system", false, true);
        setResolved(state.resolved);
      }
    };

    window.addEventListener("archistra:theme-change", onThemeChanged as EventListener);
    window.addEventListener("storage", onStorageChanged);

    if (mediaQuery) {
      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", onSystemChanged);
      } else if (typeof mediaQuery.addListener === "function") {
        mediaQuery.addListener(onSystemChanged);
      }
    }

    return () => {
      window.removeEventListener("archistra:theme-change", onThemeChanged as EventListener);
      window.removeEventListener("storage", onStorageChanged);

      if (mediaQuery) {
        if (typeof mediaQuery.removeEventListener === "function") {
          mediaQuery.removeEventListener("change", onSystemChanged);
        } else if (typeof mediaQuery.removeListener === "function") {
          mediaQuery.removeListener(onSystemChanged);
        }
      }
    };
  }, []);

  const label = useMemo(() => {
    if (mode === "system") {
      return `Theme: System (${resolved === "dark" ? "Dark" : "Light"})`;
    }
    return `Theme: ${mode === "dark" ? "Dark" : "Light"}`;
  }, [mode, resolved]);

  function cycleMode() {
    const currentIndex = CYCLE_ORDER.indexOf(mode);
    const nextMode = CYCLE_ORDER[(currentIndex + 1) % CYCLE_ORDER.length];
    const state = applyTheme(nextMode, true, true);
    modeRef.current = state.mode;
    setMode(state.mode);
    setResolved(state.resolved);
  }

  return (
    <button
      type="button"
      className={`theme-toggle ${className || ""}`.trim()}
      onClick={cycleMode}
      aria-label={label}
      title={label}
    >
      {mode === "light" ? (
        <span className="theme-toggle-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.4 5.4l1.9 1.9M16.7 16.7l1.9 1.9M18.6 5.4l-1.9 1.9M7.3 16.7l-1.9 1.9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </span>
      ) : null}
      {mode === "dark" ? (
        <span className="theme-toggle-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path
              d="M20.4 14.8a8.3 8.3 0 1 1-11.2-11 7 7 0 1 0 11.2 11Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ) : null}
      {mode === "system" ? (
        <span className="theme-toggle-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <rect x="4" y="5" width="16" height="11" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M9 19h6M12 16v3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
      ) : null}
    </button>
  );
}
