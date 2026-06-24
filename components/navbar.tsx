"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Hexagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Agents", href: "/#agents" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "History", href: "/history" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "py-2" : "py-4"
      )}
    >
      <div className="container">
        <nav
          className={cn(
            "flex items-center justify-between rounded-full px-3 py-2 transition-all duration-300",
            scrolled ? "glass shadow-lg shadow-black/20" : "bg-transparent"
          )}
        >
          <Link href="/" className="flex items-center gap-2.5 pl-2">
            <span className="relative grid h-8 w-8 place-items-center">
              <Hexagon
                className="h-8 w-8 text-agent-consensus"
                strokeWidth={1.4}
              />
              <span className="absolute h-1.5 w-1.5 rounded-full bg-agent-consensus shadow-[0_0_12px_2px_hsl(var(--agent-consensus))]" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              Verdi<span className="text-agent-consensus">kt</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link href="/analysis">
            <Button variant="primary" size="sm" className="font-medium">
              Run analysis
            </Button>
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
