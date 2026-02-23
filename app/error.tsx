"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("app_error_boundary", error);
  }, [error]);

  return (
    <main className="archistra-home">
      <section className="home-shell card-strong rounded-xl2">
        <p className="font-mono text-accent-400 text-xs tracking-widest">APPLICATION ERROR</p>
        <h1 className="home-title font-display">Something went wrong</h1>
        <p className="lead">An unexpected error occurred while rendering this page.</p>
        <div className="home-actions">
          <button
            type="button"
            onClick={reset}
            className="btn btn-primary w-full sm:w-auto px-4 py-2.5 text-[0.8125rem] leading-[1.125rem] font-semibold font-alt"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="btn btn-ghost w-full sm:w-auto px-4 py-2.5 text-[0.8125rem] leading-[1.125rem] font-semibold font-alt"
          >
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}
