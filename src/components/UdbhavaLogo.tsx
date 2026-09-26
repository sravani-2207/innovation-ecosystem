import { Link } from "react-router";
import logo from "@/assets/logo.svg";

export function UdbhavaMark({ className }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="udbhava"
      className={`size-8 rounded-lg ${className ?? ""}`}
    />
  );
}

/**
 * Wordmark: lowercase "udbhava" with a quiet tagline. The subtitle differs by
 * context so the emergence story stays consistent without repeating verbatim.
 */
export function UdbhavaLogo({
  to = "/",
  subtitle = "from emergence to existence",
  className,
}: {
  to?: string;
  subtitle?: string | null;
  className?: string;
}) {
  return (
    <Link to={to} className={`group flex items-center gap-2.5 ${className ?? ""}`}>
      <UdbhavaMark className="transition-transform group-hover:scale-105" />
      <div className="leading-tight">
        <span className="block text-[15px] font-semibold lowercase tracking-[0.2em] text-foreground">
          udbhava
        </span>
        {subtitle && (
          <span className="block text-[10px] font-medium tracking-wide text-muted-foreground">
            {subtitle}
          </span>
        )}
      </div>
    </Link>
  );
}
