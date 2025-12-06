"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CompassIcon, HomeIcon, LineChartIcon, UsersIcon } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/explore", label: "Explore", icon: CompassIcon },
  { href: "/markets", label: "Markets", icon: LineChartIcon },
  { href: "/groups", label: "Groups", icon: UsersIcon },
];

export default function SidebarNavLinks() {
  const pathname = usePathname();

  return (
    <div className="grid gap-2 text-sm">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href || (href !== "/" && pathname?.startsWith(`${href}/`));

        return (
          <Button
            key={href}
            variant={isActive ? "secondary" : "ghost"}
            className={cn("justify-start gap-2", isActive && "shadow-sm")}
            asChild
          >
            <Link href={href}>
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
