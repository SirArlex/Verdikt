"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConsensusHeroVisual } from "@/components/consensus-hero-visual";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-24 sm:pt-44">
      <div className="pointer-events-none absolute inset-0 bg-grid mask-radial opacity-50" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-agent-trust/10 blur-[120px]" />

      <div className="container relative grid items-center gap-12 lg:grid-cols-2">
        <div>
          <motion.div
            custom={0}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="eyebrow"
          >
            <Sparkles className="h-3 w-3 text-agent-consensus" />
            Multi-agent decision layer
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl"
          >
            One signal lies.
            <br />
            <span className="text-gradient">A council decides.</span>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground"
          >
            Verdikt runs four specialized agents over any token, lets a
            moderator weigh their debate, and resolves a single verdict you can
            actually trust — with the reasoning shown in full.
          </motion.p>

          <motion.div
            custom={3}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link href="/analysis">
              <Button variant="primary" size="lg">
                Run an analysis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/#how-it-works">
              <Button variant="outline" size="lg">
                See how it works
              </Button>
            </Link>
          </motion.div>

          <motion.div
            custom={4}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-10 flex items-center gap-6 font-mono text-xs text-muted-foreground"
          >
            <span>4 agents</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>1 moderator</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>weighted verdict</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <ConsensusHeroVisual />
        </motion.div>
      </div>
    </section>
  );
}
