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
    <div className="flex flex-col gap-2 rounded border border-gray-200 bg-white p-3">
      <div className="flex h-32 items-center justify-center overflow-hidden rounded bg-gray-50">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={filename} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-gray-500">{mimeType || "arquivo"}</span>
        )}
      </div>
      <p className="truncate text-sm font-medium text-gray-900" title={filename}>
        {filename}
      </p>
      <p className="text-xs text-gray-500">
        {formatSize(size)} · {new Date(createdAt).toLocaleDateString("pt-BR")}
      </p>
      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded border border-gray-300 px-2 py-1 text-xs font-medium text-red-600 disabled:opacity-50"
        >
          Excluir
        </button>
        {state.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
      </form>
    </div>
  );
}
