/**
 * Combined providers wrapper.
 *
 * Stacks all client-side providers in the correct nesting order.
 * Used in the root layout to avoid provider-wrapping noise.
 */
"use client";

import { Toaster } from "sonner";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
        <Toaster closeButton richColors position="top-center" />
      </QueryProvider>
    </ThemeProvider>
  );
}
