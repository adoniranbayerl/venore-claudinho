"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { deleteMediaAction, type MediaActionState } from "../actions";

const initialState: MediaActionState = { error: null };

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaItem({
  id,
  filename,
  url,
  mimeType,
  size,
  createdAt,
  visibility,
}: {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
  visibility: "private" | "public";
}) {
  const [state, formAction, pending] = useActionState(deleteMediaAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Arquivo excluído." });
  const isImage = mimeType.startsWith("image/");

  return (
    <div className="flex flex-col gap-2 rounded-panel border border-border bg-card p-3">
      <div className="flex h-32 items-center justify-center overflow-hidden rounded-md bg-muted">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={filename} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-muted-foreground/56">arquivo</span>
        )}
      </div>
      <p className="truncate text-sm font-medium text-foreground" title={filename}>
        {filename}
      </p>
      <p className="text-xs text-muted-foreground/56">
        {formatSize(size)} · {new Date(createdAt).toLocaleDateString("pt-BR")}
      </p>
      <span className="w-fit rounded-sm border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
        {visibility === "public" ? "Público" : "Privado"}
      </span>
      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        <Button type="submit" variant="outline" size="sm" disabled={pending} className="w-full text-destructive">
          Excluir
        </Button>
      </form>
    </div>
  );
}
