import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UdbhavaLogo } from "@/components/UdbhavaLogo";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import {
  Building2,
  Compass,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Navigate, useNavigate } from "react-router";
import { useQuery } from "convex/react";

const NAV = {
  student: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/challenges", label: "Discover Challenges", icon: Compass },
    { to: "/showcase", label: "Showcase", icon: Compass },
    { to: "/profile", label: "Profile", icon: User },
  ],
  organization: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/post-challenge", label: "Post Challenge", icon: Building2 },
    { to: "/challenges", label: "All Challenges", icon: Compass },
    { to: "/profile", label: "Profile", icon: User },
  ],
};

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const profileData = useQuery(api.profiles.getCurrentProfile, {});
  const role = user?.role === "organization" ? "organization" : "student";
  const items = NAV[role];

  // First sign-in: route to onboarding until a profile exists.
  if (profileData === null) return <Navigate to="/onboarding" replace />;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/70 bg-sidebar p-4 lg:flex">
        <UdbhavaLogo to="/dashboard" subtitle={role === "organization" ? "Organization workspace" : "Student workspace"} />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Separator className="my-3" />
        <div className="flex items-center gap-2.5 px-1 pb-2">
          <Avatar className="size-8">
            <AvatarFallback className="bg-secondary text-xs font-bold text-secondary-foreground">
              {(user?.name ?? "U").slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name ?? "Account"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" className="justify-start gap-2 text-muted-foreground" onClick={handleSignOut}>
          <LogOut className="size-4" />
          Log out
        </Button>
      </aside>

      {/* Mobile top bar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/70 bg-background/90 px-4 backdrop-blur-md lg:hidden">
          <UdbhavaLogo to="/dashboard" />
          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setOpen((o) => !o)}
            className="flex size-9 items-center justify-center rounded-lg border border-border bg-card"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </header>
        {open && (
          <div className="border-b border-border/70 bg-background px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="size-4" />
                Log out
              </button>
            </div>
          </div>
        )}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

export default DashboardLayout;
