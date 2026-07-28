"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { listMediaForPickerAction, type PickableMedia } from "@/components/media-picker-field.actions";

// Variante controlada (value/onChange) de components/media-picker-field.tsx: aquele componente
// só existe pra formulários com FormData (input hidden por name); aqui o valor mora na árvore de
// composição em memória, então precisamos do callback em vez de um input escondido.
export function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (mediaId: string | null) => void;
}) {
  const [selected, setSelected] = useState<PickableMedia | null>(null);
  const [items, setItems] = useState<PickableMedia[]>([]);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (selected?.id === value) return;
    startTransition(async () => {
      if (!value) {
        setSelected(null);
        return;
      }
      const media = await listMediaForPickerAction();
      setSelected(media.find((item) => item.id === value) ?? null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só precisa reagir a mudanças externas de `value`
  }, [value]);

  function openPicker() {
    startTransition(async () => {
      const media = await listMediaForPickerAction();
      setItems(media);
      dialogRef.current?.showModal();
    });
  }

  function selectMedia(media: PickableMedia) {
    setSelected(media);
    onChange(media.id);
    dialogRef.current?.close();
  }

  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>

      <div className="mt-1 flex items-center gap-3">
        {selected && (
          <div className="flex items-center gap-2 rounded border border-border px-2 py-1">
            {selected.mimeType.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element -- mesmo padrão de media-picker-field.tsx
              <img src={selected.url} alt={selected.filename} className="h-8 w-8 rounded object-cover" />
            ) : null}
            <span className="max-w-40 truncate text-xs text-muted-foreground">{selected.filename}</span>
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                onChange(null);
              }}
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
          className="rounded border border-ring px-2 py-1 text-xs font-medium text-foreground disabled:opacity-50"
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
          <button type="button" onClick={() => dialogRef.current?.close()} className="text-sm text-muted-foreground/56">
            Fechar
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => selectMedia(item)}
              className="flex flex-col gap-1 rounded border border-border p-2 text-left hover:border-ring"
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
