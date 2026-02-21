"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type AuthSlotProps = {
  isAuthenticated: boolean;
  email: string | null;
  orgLabel: string;
};

function formatLabel(email: string | null): string {
  if (!email) return "ACCOUNT";
  const local = email.split("@")[0] || "ACCOUNT";
  return local.slice(0, 18).toUpperCase();
}

export function AuthSlot({ isAuthenticated, email, orgLabel }: AuthSlotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    function onDocumentClick(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", onDocumentClick);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onDocumentClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <a href="/auth/login?returnTo=/chat" className="btn btn-primary btn-size-nav font-semibold u-font-code">
        SIGN UP
      </a>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        className="btn btn-primary btn-size-nav auth-chip u-font-code"
        aria-expanded={isOpen}
        aria-controls="next-auth-menu"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {formatLabel(email)}
      </button>

      {isOpen ? (
        <div id="next-auth-menu" className="auth-menu card" role="menu">
          <p className="auth-menu-meta u-text-3 u-font-code">{email || "No email"}</p>
          <p className="auth-menu-meta u-text-3 u-font-code">Org: {orgLabel}</p>
          <Link href="/chat" className="auth-menu-item" role="menuitem" onClick={() => setIsOpen(false)}>
            Continue to Chat
          </Link>
          <a href="/auth/logout" className="auth-menu-item" role="menuitem" onClick={() => setIsOpen(false)}>
            Log Out
          </a>
        </div>
      ) : null}
    </div>
  );
}
