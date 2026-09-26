import { Link } from "react-router";
import logo from "@/assets/logo.svg";

export function UdbhavaMark({ className }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="Udbhava logo"
      className={`size-8 rounded-lg ${className ?? ""}`}
    />
  );
}

export function UdbhavaLogo({
  to = "/",
  subtitle,
}: {
  to?: string;
  subtitle?: string;
}) {
  return (
    <Link to={to} className="group flex items-center gap-2.5">
      <UdbhavaMark className="transition-transform group-hover:scale-105" />
      <div className="leading-tight">
        <span className="block text-[15px] font-bold tracking-[0.14em] text-foreground">
          UDBHAVA
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
