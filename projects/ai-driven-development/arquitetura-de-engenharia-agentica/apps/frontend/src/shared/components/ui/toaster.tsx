"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      richColors
      position="bottom-right"
      closeButton
      offset={{ bottom: 40, right: 40 }}
    />
  );
}
