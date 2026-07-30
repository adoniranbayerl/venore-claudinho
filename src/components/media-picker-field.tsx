"use client";

import Link from "next/link";
import { ImageOff } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { listMediaForPickerAction, type PickableMedia } from "./media-picker-field.actions";

export function MediaPickerField({
  name,
  label = "Mídia (opcional)",
  initialMedia = null,
  onSelect,
}: {
  name: string;
  label?: string;
  initialMedia?: PickableMedia | null;
  onSelect?: (media: PickableMedia | null) => void;
}) {
  const [selected, setSelected] = useState<PickableMedia | null>(initialMedia);
  const [items, setItems] = useState<PickableMedia[]>([]);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);

  function openPicker() {
    dialogRef.current?.showModal();
    startTransition(async () => {
      const media = await listMediaForPickerAction();
      setItems(media);
    });
  }

  function selectMedia(media: PickableMedia) {
    setSelected(media);
    onSelect?.(media);
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
              onClick={() => {
                setSelected(null);
                onSelect?.(null);
              }}
              className="rounded-sm text-xs font-medium text-destructive outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
            >
              Remover
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={openPicker}
          className="rounded-lg border border-border px-2 py-1 text-xs font-medium text-foreground outline-none ui-motion-base hover:border-ring focus-visible:ring-2 focus-visible:ring-ring"
        >
          {selected ? "Trocar" : "Selecionar mídia"}
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className="w-full max-w-2xl rounded-panel border border-border bg-card ui-panel-padding-roomy text-foreground backdrop:bg-foreground/40"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Selecionar mídia</h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-sm text-sm text-muted-foreground/56 outline-none ui-motion-base hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Fechar
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {isPending
            ? Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="aspect-square rounded-lg" />)
            : items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => selectMedia(item)}
                  className="flex flex-col gap-1 rounded-lg border border-border p-2 text-left outline-none ui-motion-base hover:border-ring focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex h-16 items-center justify-center overflow-hidden rounded-md bg-muted">
                    {item.mimeType.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt={item.filename} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground/56">arquivo</span>
                    )}
                  </div>
                  <span className="truncate text-[11px] text-muted-foreground" title={item.filename}>
                    {item.filename}
                  </span>
                </button>
              ))}
          {!isPending && items.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-2 py-6 text-center">
              <ImageOff className="size-6 text-muted-foreground/56" strokeWidth={1.5} />
              <p className="text-sm text-foreground">Nenhum arquivo enviado ainda</p>
              <p className="text-xs text-muted-foreground">Envie imagens na página de Mídia para poder selecioná-las aqui.</p>
              <Link
                href="/admin/media"
                className="rounded-sm text-xs font-medium text-foreground outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                Ir para Mídia
              </Link>
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}
