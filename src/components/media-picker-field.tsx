"use client";

import { useRef, useState, useTransition } from "react";
import { listMediaForPickerAction, type PickableMedia } from "./media-picker-field.actions";

export function MediaPickerField({
  name,
  label = "Mídia (opcional)",
  initialMedia = null,
}: {
  name: string;
  label?: string;
  initialMedia?: PickableMedia | null;
}) {
  const [selected, setSelected] = useState<PickableMedia | null>(initialMedia);
  const [items, setItems] = useState<PickableMedia[]>([]);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);

  function openPicker() {
    startTransition(async () => {
      const media = await listMediaForPickerAction();
      setItems(media);
      dialogRef.current?.showModal();
    });
  }

  function selectMedia(media: PickableMedia) {
    setSelected(media);
    dialogRef.current?.close();
  }

  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      <input type="hidden" name={name} value={selected?.id ?? ""} />

      <div className="mt-1 flex items-center gap-3">
        {selected && (
          <div className="flex items-center gap-2 rounded border border-border px-2 py-1">
            {selected.mimeType.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.url} alt={selected.filename} className="h-8 w-8 rounded object-cover" />
            ) : null}
            <span className="max-w-[12rem] truncate text-xs text-muted-foreground">{selected.filename}</span>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-xs font-medium text-destructive"
            >
              Remover
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={openPicker}
          disabled={isPending}
          className="rounded border border-border px-2 py-1 text-xs font-medium text-foreground disabled:opacity-50"
        >
          {selected ? "Trocar" : "Selecionar mídia"}
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className="w-full max-w-2xl rounded border border-border bg-card p-4 text-foreground backdrop:bg-black/40"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Selecionar mídia</h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="text-sm text-muted-foreground/56"
          >
            Fechar
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => selectMedia(item)}
              className="flex flex-col gap-1 rounded border border-border p-2 text-left hover:border-input"
            >
              <div className="flex h-16 items-center justify-center overflow-hidden rounded bg-muted">
                {item.mimeType.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.filename} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] text-muted-foreground/56">{item.mimeType || "arquivo"}</span>
                )}
              </div>
              <span className="truncate text-[11px] text-muted-foreground" title={item.filename}>
                {item.filename}
              </span>
            </button>
          ))}
          {items.length === 0 && <p className="col-span-full text-sm text-muted-foreground/56">Nenhum arquivo enviado ainda.</p>}
        </div>
      </dialog>
    </div>
  );
}
