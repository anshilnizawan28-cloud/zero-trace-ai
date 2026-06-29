import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Shield, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function SiteNav() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
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
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link to="/" className="hover:text-foreground" activeOptions={{ exact: true }}
            activeProps={{ className: "text-foreground" }}>Product</Link>
          <Link to="/dashboard" className="hover:text-foreground"
            activeProps={{ className: "text-foreground" }}>Dashboard</Link>
          <Link to="/analyze" className="hover:text-foreground"
            activeProps={{ className: "text-foreground" }}>Analyze</Link>
          <a href="#security" className="hover:text-foreground">Security</a>
        </nav>
        <div className="flex items-center gap-2">
          {loading ? null : user ? (
            <>
              <div className="hidden items-center gap-2 rounded-md border border-border/60 bg-card/40 px-2.5 py-1.5 text-xs sm:flex">
                <div className="grid h-5 w-5 place-items-center rounded-full bg-gradient-cyber text-primary-foreground">
                  <UserIcon className="h-3 w-3" />
                </div>
                <span className="max-w-[160px] truncate text-foreground/90">{user.email}</span>
              </div>
              <Link
                to="/app"
                className="rounded-md bg-gradient-cyber px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-glow"
              >
                Open workspace
              </Link>
              <button
                onClick={async () => { await signOut(); navigate({ to: "/" }); }}
                className="hidden items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm text-foreground/90 hover:bg-accent/40 sm:inline-flex"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
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
                className="rounded-md bg-gradient-cyber px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-glow"
              >
                Start free trial
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}