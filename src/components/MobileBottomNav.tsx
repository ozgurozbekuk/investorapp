"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type LucideIcon,
  Compass,
  Home,
  LineChart,
  Users,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignedIn } from "@clerk/nextjs";

type NavItem = {
  label: string;
  href: string;
  Icon: LucideIcon;
  match?: string[];
};

const navItems: NavItem[] = [
  { label: "Market", href: "/markets", Icon: LineChart, match: ["/market"] },
  { label: "Explore", href: "/explore", Icon: Compass },
  { label: "Home", href: "/", Icon: Home, match: ["/home"] },
  { label: "Groups", href: "/groups", Icon: Users },
  { label: "Profile", href: "/profile", Icon: User },
];

const isRouteActive = (pathname: string, item: NavItem) => {
  const matches = [item.href, ...(item.match ?? [])];

  return matches.some((route) => {
    if (route === "/") {
      return pathname === "/" || pathname.startsWith("/home");
    }

    return pathname === route || pathname.startsWith(`${route}/`);
  });
};

export default function MobileBottomNav() {
  const pathname = usePathname() || "/";


  return (
    <SignedIn>
      <nav
        role="navigation"
        aria-label="Bottom navigation"
        className="fixed inset-x-0 bottom-0 z-[60] md:hidden"
      >
        <div className="mx-auto max-w-3xl px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
          <div className="grid grid-cols-5 overflow-hidden rounded-t-2xl border border-border/60 bg-background/90 shadow-[0_-12px_30px_-16px_rgba(0,0,0,0.35)] backdrop-blur supports-[backdrop-filter]:bg-background/75">
            {navItems.map((item) => {
              const active = isRouteActive(pathname, item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  className={cn(
                    "relative flex items-center justify-center py-4 text-muted-foreground transition-colors",
                    active && "text-primary"
                  )}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-10 top-1 h-0.5 rounded-full bg-primary"
                    />
                  )}
                  <item.Icon
                    className={cn(
                      "transition-transform",
                      item.label === "Home" ? "h-8 w-8" : "h-6 w-6"
                    )}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </SignedIn>
  );
}
