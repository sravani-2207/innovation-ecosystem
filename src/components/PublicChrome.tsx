import { Button } from "@/components/ui/button";
import { UdbhavaLogo } from "@/components/UdbhavaLogo";
import { useAuth } from "@/hooks/use-auth";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

const LINKS = [
  { to: "/challenges", label: "Catalog" },
  { to: "/showcase", label: "Showcase" },
  { to: "/#how", label: "How it works" },
];

export function PublicNav() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const dashboardLabel =
    user?.role === "organization"
      ? "Organization dashboard"
      : user?.role === "admin"
        ? "Admin"
        : "Dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <UdbhavaLogo />
        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {!isLoading && isAuthenticated ? (
            <Button onClick={() => navigate("/dashboard")}>{dashboardLabel}</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/auth")}>
                Log in
              </Button>
              <Button onClick={() => navigate("/auth?mode=register")}>
                Create account
              </Button>
            </>
          )}
        </div>
        <button
          type="button"
          aria-label="Toggle menu"
          className="flex size-9 items-center justify-center rounded-lg border border-border bg-card md:hidden"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border/70 bg-background px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              {!isLoading && isAuthenticated ? (
                <Button className="flex-1" onClick={() => navigate("/dashboard")}>
                  {dashboardLabel}
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/auth")}
                  >
                    Log in
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => navigate("/auth?mode=register")}
                  >
                    Create account
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

const FOOTER_LINKS: { label: string; to: string }[] = [
  { label: "How it works", to: "/#how" },
  { label: "Catalog", to: "/challenges" },
  { label: "Showcase", to: "/showcase" },
  { label: "Log in", to: "/auth" },
  { label: "Create account", to: "/auth?mode=register" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-border/70 bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <UdbhavaLogo />
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              A quiet, focused workspace for our team. Ideas begin as raw
              problems here — and leave as tested, documented solutions.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-2">
            {FOOTER_LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} udbhava. Internal use.</span>
          <span>Used and maintained by our own team.</span>
        </div>
      </div>
    </footer>
  );
}
