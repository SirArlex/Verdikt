import Link from "next/link";
import { Hexagon } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-border/60 py-12">
      <div className="container flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <Hexagon className="h-5 w-5 text-agent-consensus" strokeWidth={1.5} />
          <span className="font-display text-sm font-semibold">
            Verdi<span className="text-agent-consensus">kt</span>
          </span>
          <span className="ml-2 font-mono text-xs text-muted-foreground">
            decision infrastructure for AI trading
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/analysis" className="transition-colors hover:text-foreground">
            Analysis
          </Link>
          <Link href="/history" className="transition-colors hover:text-foreground">
            History
          </Link>
          <span className="font-mono text-xs">
            Built for the Bitget Agentic Trading Hackathon
          </span>
        </div>
      </div>
    </footer>
  );
}
