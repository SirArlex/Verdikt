"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AnalyzeRequest } from "@/types";

const EXAMPLES = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];

export function AnalysisForm({
  onSubmit,
  loading,
}: {
  onSubmit: (req: AnalyzeRequest) => void;
  loading: boolean;
}) {
  const [symbol, setSymbol] = useState("");
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState("arc");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const canSubmit = symbol.trim().length >= 3 && !loading;

  function submit() {
    if (!canSubmit) return;
    onSubmit({
      symbol: symbol.trim().toUpperCase(),
      address: address.trim() || undefined,
      chain: address.trim() ? chain : undefined,
    });
  }

  return (
    <div className="glass rounded-2xl p-2">
      {/* main input row */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 px-4">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Enter a trading pair, e.g. BTCUSDT"
            spellCheck={false}
            className="h-12 w-full bg-transparent font-mono text-base text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={submit}
          disabled={!canSubmit}
          className="sm:w-44"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Convening
            </>
          ) : (
            "Run analysis"
          )}
        </Button>
      </div>

      {/* examples + advanced toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-1 pt-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Try
          </span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setSymbol(ex)}
              disabled={loading}
              className="rounded-full border border-border bg-secondary/40 px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-agent-consensus/40 hover:text-foreground disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        >
          Contract address
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              showAdvanced && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* advanced: contract address for full TrustGate scoring */}
      <AnimatePresence initial={false}>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-4 pb-3 pt-2 sm:flex-row">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x… contract address (enables full TrustGate score)"
                spellCheck={false}
                className="h-11 flex-1 rounded-xl border border-border bg-secondary/30 px-4 font-mono text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-agent-consensus/40"
              />
              <select
                value={chain}
                onChange={(e) => setChain(e.target.value)}
                className="h-11 rounded-xl border border-border bg-secondary/30 px-3 font-mono text-sm text-foreground outline-none focus:border-agent-consensus/40"
              >
                <option value="arc">arc</option>
                <option value="ethereum">ethereum</option>
                <option value="bsc">bsc</option>
                <option value="base">base</option>
              </select>
            </div>
            <p className="px-4 pb-3 text-xs leading-relaxed text-muted-foreground">
              Without a contract address, the Trust Agent runs in degraded mode on
              Bitget volume data. TrustGate scores most reliably on Arc-chain tokens.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
