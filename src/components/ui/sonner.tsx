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
            "flex w-full items-center gap-3 rounded-panel border border-border bg-card px-4 py-3 text-sm text-foreground shadow-float",
          title: "font-medium",
          description: "text-muted-foreground",
          actionButton: "rounded-xl bg-primary px-2 py-1 text-xs font-medium text-primary-foreground",
          cancelButton: "rounded-xl bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground",
          closeButton: "border-border bg-muted text-muted-foreground",
          success: "!border-primary !bg-primary !text-primary-foreground",
          error: "!border-destructive !bg-destructive !text-destructive-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
