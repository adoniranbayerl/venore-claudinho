"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
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
import { createMenuAction, type MenuActionState } from "../actions";

const initialState: MenuActionState = { error: null };

const LOCATION_OPTIONS: Array<{ value: string; label: string; description: string }> = [
  { value: "main", label: "Principal (main)", description: "Navegação principal do site — só um menu por vez." },
  { value: "header", label: "Cabeçalho (header)", description: "Navegação do cabeçalho — só um menu por vez." },
  { value: "sitemap", label: "Mapa do site (sitemap)", description: "Estrutura exibida no mapa do site — só um menu por vez." },
  { value: "contextual", label: "Contextual", description: "Navegação de uma seção específica, por prefixo de rota. Vários menus permitidos." },
];

export function CreateMenuDialog() {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState("main");
  const [state, formAction, pending] = useActionState(createMenuAction, initialState);

  useActionToast({
    pending,
    error: state.error,
    successMessage: "Menu criado.",
    onSuccess: () => setOpen(false),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus /> Criar menu
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar menu</DialogTitle>
          <DialogDescription>
            Um menu define o que aparece na navegação — ele pode existir vazio, antes de qualquer conteúdo.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground">Chave</label>
            <Input name="key" required className="mt-1" placeholder="ex: main-nav" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground">Nome</label>
            <Input name="name" required className="mt-1" placeholder="ex: Navegação principal" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground">Localização</label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="location" value={location} />
            <p className="mt-1 text-xs text-muted-foreground/56">
              {LOCATION_OPTIONS.find((option) => option.value === location)?.description}
            </p>
          </div>

          {location === "contextual" && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Prefixo de rota (scopePath)</label>
              <Input name="scopePath" required className="mt-1" placeholder="ex: /academy" />
              <p className="mt-1 text-xs text-muted-foreground/56">
                Este menu aparece em qualquer rota que comece com este prefixo — a correspondência mais longa vence.
              </p>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              Criar menu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
