"use client";

import { useActionState } from "react";
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
}: {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}) {
  const [state, formAction, pending] = useActionState(deleteMediaAction, initialState);
  const isImage = mimeType.startsWith("image/");

  return (
    <div className="flex flex-col gap-2 rounded border border-border bg-card p-3">
      <div className="flex h-32 items-center justify-center overflow-hidden rounded bg-muted">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={filename} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-muted-foreground/56">{mimeType || "arquivo"}</span>
        )}
      </div>
      <p className="truncate text-sm font-medium text-foreground" title={filename}>
        {filename}
      </p>
      <p className="text-xs text-muted-foreground/56">
        {formatSize(size)} · {new Date(createdAt).toLocaleDateString("pt-BR")}
      </p>
      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded border border-border px-2 py-1 text-xs font-medium text-destructive disabled:opacity-50"
        >
          Excluir
        </button>
        {state.error && <p className="mt-1 text-xs text-destructive">{state.error}</p>}
      </form>
    </div>
  );
}
