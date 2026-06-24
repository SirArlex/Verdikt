"use client";

import { useEffect, useState } from "react";
import { animate, useMotionValue, useTransform } from "framer-motion";

export function CountUp({
  to,
  duration = 1.4,
  delay = 0,
  className,
}: {
  to: number;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));
  const [val, setVal] = useState(0);

  useEffect(() => {
    const unsub = rounded.on("change", setVal);
    const controls = animate(mv, to, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => {
      unsub();
      controls.stop();
    };
  }, [mv, rounded, to, duration, delay]);

  return <span className={className}>{val}</span>;
}
