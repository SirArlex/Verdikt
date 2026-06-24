import { Hero } from "@/components/hero";
import { ProblemStatement } from "@/components/sections/problem-statement";
import { WhyMultiAgent } from "@/components/sections/why-multi-agent";
import { AgentEcosystem } from "@/components/sections/agent-ecosystem";
import { HowItWorks } from "@/components/sections/how-it-works";
import { CTA } from "@/components/sections/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemStatement />
      <WhyMultiAgent />
      <AgentEcosystem />
      <HowItWorks />
      <CTA />
    </>
  );
}
