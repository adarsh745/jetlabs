"use client";

import { motion } from "framer-motion";
import { Orbit } from "lucide-react";
import {
  AUTH_HERO_CONTENT,
  AUTH_HERO_STATS,
  SYNTRA_BRAND_NAME,
} from "@/lib/auth/presentation";
import { StatsCard } from "@/components/auth/stats-card";

export function AuthHero() {
  return (
    <aside className="relative hidden overflow-hidden border-r border-border bg-panel lg:flex">
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%)]" />

      <div className="relative z-10 flex w-full flex-col justify-between px-12 py-14 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex items-center gap-4"
        >
          <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-card text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
            <Orbit className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-white">
              {SYNTRA_BRAND_NAME}
            </p>
            <p className="text-sm text-white/60">{AUTH_HERO_CONTENT.badge}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
          className="max-w-2xl space-y-8"
        >
          <div className="space-y-5">
            <p className="inline-flex rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-white/72">
              {AUTH_HERO_CONTENT.badge}
            </p>
            <h2 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-balance text-white xl:text-6xl">
              {AUTH_HERO_CONTENT.title}
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-white/68">
              {AUTH_HERO_CONTENT.description}
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {AUTH_HERO_STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08 + index * 0.05, ease: "easeOut" }}
              >
                <StatsCard {...stat} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="max-w-xl text-sm leading-7 text-white/50"
        >
          {AUTH_HERO_CONTENT.footer}
        </motion.p>
      </div>
    </aside>
  );
}
