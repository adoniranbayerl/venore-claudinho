"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      className="toaster group"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-center gap-3 rounded-panel border border-border-default bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-float",
          title: "font-medium",
          description: "text-text-secondary",
          actionButton: "rounded-control bg-primary px-2 py-1 text-xs font-medium text-primary-foreground",
          cancelButton: "rounded-control bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground",
          closeButton: "border-border-subtle bg-surface-elevated text-text-secondary",
          success: "!border-primary !bg-primary !text-primary-foreground",
          error: "!border-destructive !bg-destructive !text-destructive-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
