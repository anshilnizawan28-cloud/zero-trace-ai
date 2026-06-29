import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, Shield, User as UserIcon, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  ["Features", "/features"],
  ["Pricing", "/pricing"],
  ["Enterprise", "/enterprise"],
  ["Security", "/security"],
  ["Documentation", "/docs"],
  ["API", "/api-reference"],
  ["Blog", "/blog"],
  ["Contact", "/contact"],
] as const;

export function SiteNav() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="relative grid h-9 w-9 place-items-center rounded-lg bg-gradient-cyber shadow-glow">
            <Shield className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">ZeroVault</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Forensic Analyzer
            </span>
          </div>
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-5 text-sm text-muted-foreground xl:flex">
          {NAV.map(([label, to]) => (
            <Link
              key={to}
              to={to as any}
              className="hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            search={{ mode: "signin" }}
            className="hidden rounded-md border border-border px-3 py-1.5 text-sm text-foreground/90 hover:bg-accent/40 sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="hidden rounded-md bg-gradient-cyber px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-glow sm:inline-flex"
          >
            Start free trial
          </Link>
          {!loading && user && (
            <>
              <div className="hidden items-center gap-2 rounded-md border border-border/60 bg-card/40 px-2.5 py-1.5 text-xs lg:flex">
                <div className="grid h-5 w-5 place-items-center rounded-full bg-gradient-cyber text-primary-foreground">
                  <UserIcon className="h-3 w-3" />
                </div>
                <span className="max-w-[140px] truncate text-foreground/90">{user.email}</span>
              </div>
              <Link
                to="/dashboard"
                className="hidden rounded-md border border-primary/50 bg-primary/10 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-primary/20 sm:inline-flex"
              >
                Dashboard
              </Link>
              <button
                onClick={async () => { await signOut(); navigate({ to: "/" }); }}
                className="hidden items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm text-foreground/90 hover:bg-accent/40 sm:inline-flex"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-md border border-border xl:hidden"
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background/95 xl:hidden">
          <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-1 px-4 py-4 text-sm">
            {NAV.map(([label, to]) => (
              <Link
                key={to}
                to={to as any}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-muted-foreground hover:bg-accent/40 hover:text-foreground"
              >
                {label}
              </Link>
            ))}
            <Link to="/auth" search={{ mode: "signin" }} onClick={() => setOpen(false)} className="col-span-1 rounded-md border border-border px-3 py-2 text-center">Sign in</Link>
            <Link to="/auth" search={{ mode: "signup" }} onClick={() => setOpen(false)} className="col-span-1 rounded-md bg-gradient-cyber px-3 py-2 text-center font-medium text-primary-foreground">Start free trial</Link>
          </nav>
        </div>
      )}
    </header>
  );
}