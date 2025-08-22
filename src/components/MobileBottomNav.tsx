
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  MessageSquare,
  CalendarDays,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Séances", href: "/seances", icon: Calendar },
  { name: "Docs", href: "/documents", icon: FileText },
  { name: "Comms", href: "/commentaires", icon: MessageSquare },
  { name: "Planning", href: "/planning", icon: CalendarDays },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav
      className="
        fixed inset-x-0 bottom-0 z-40 md:hidden
        bg-card border-t border-border
        shadow-sm
        safe-bottom
      "
      aria-label="Navigation principale mobile"
    >
      <div className="mx-auto w-full max-w-7xl">
        <ul className="grid grid-cols-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <li key={item.name} className="flex">
                <Link
                  to={item.href}
                  className={`
                    flex flex-col items-center justify-center flex-1
                    py-2
                    text-xs
                    transition-colors
                    ${isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"}
                  `}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-5 w-5" />
                  <span className="mt-1 truncate">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      {/* Ajout du padding lié au safe area iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

export default MobileBottomNav;
