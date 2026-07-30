"use client";

import { useActionState, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import { NAV_ICON_KEYS } from "@/platform/nav-icons/registry";
import { NavIcon } from "@/platform/nav-icons/NavIcon";
import { createMenuItemAction, type MenuActionState } from "../actions";
import { ContentPicker } from "./content-picker";
import type { ContentSearchResult } from "../actions";

const initialState: MenuActionState = { error: null };

const TARGET_TYPE_OPTIONS = [
  { value: "content", label: "Conteúdo publicado" },
  { value: "route", label: "Rota interna" },
  { value: "external", label: "URL externa" },
  { value: "label", label: "Rótulo sem link (agrupador)" },
];

// "none" (não "") porque <Select> do shadcn não aceita item com value vazio — convertido de volta
// pra string vazia só na hora de montar o hidden input, que é o que createMenuItemAction lê.
const NO_ICON_VALUE = "none";

export function AddMenuItemDialog({
  menuId,
  parentId,
  parentLabel,
  trigger,
}: {
  menuId: string;
  parentId: string | null;
  parentLabel?: string;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [targetType, setTargetType] = useState("content");
  const [selectedContent, setSelectedContent] = useState<ContentSearchResult | null>(null);
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState(NO_ICON_VALUE);
  const [state, formAction, pending] = useActionState(createMenuItemAction, initialState);

  useActionToast({
    pending,
    error: state.error,
    successMessage: "Item adicionado ao menu.",
    onSuccess: () => {
      setOpen(false);
      setSelectedContent(null);
      setLabel("");
      setIcon(NO_ICON_VALUE);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar item{parentLabel ? ` em "${parentLabel}"` : ""}</DialogTitle>
          <DialogDescription>
            O rótulo do item é independente do título do conteúdo — você pode encurtar o texto exibido no menu.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-3">
          <input type="hidden" name="menuId" value={menuId} />
          {parentId && <input type="hidden" name="parentId" value={parentId} />}
          <input type="hidden" name="targetType" value={targetType} />
          <input type="hidden" name="icon" value={icon === NO_ICON_VALUE ? "" : icon} />
          {targetType === "content" && selectedContent && (
            <input type="hidden" name="contentId" value={selectedContent.id} />
          )}

          <div>
            <label className="block text-xs font-medium text-muted-foreground">Destino</label>
            <Select value={targetType} onValueChange={setTargetType}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TARGET_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {targetType === "content" && (
            <ContentPicker selected={selectedContent} onSelect={setSelectedContent} />
          )}

          {targetType === "route" && (
            <>
              <div>
                <label className="block text-xs font-medium text-muted-foreground">Rota</label>
                <Input name="routePath" required className="mt-1" placeholder="ex: /admin/media" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Permission exigida (opcional)
                </label>
                <Input name="requiredPermissionKey" className="mt-1" placeholder="ex: media.manage" />
              </div>
            </>
          )}

          {targetType === "external" && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground">URL externa</label>
              <Input name="externalUrl" required type="url" className="mt-1" placeholder="https://" />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-muted-foreground">Ícone (opcional)</label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_ICON_VALUE}>Sem ícone</SelectItem>
                {NAV_ICON_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <NavIcon iconKey={key} className="size-4" />
                      {key}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground">Rótulo no menu</label>
            <Input
              name="label"
              required
              className="mt-1"
              placeholder={targetType === "content" && selectedContent ? selectedContent.title : "ex: Contato"}
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending || (targetType === "content" && !selectedContent)}>
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
