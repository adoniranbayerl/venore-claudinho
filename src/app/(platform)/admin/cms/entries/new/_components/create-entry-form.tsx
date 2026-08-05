"use client";

import { useActionState, useState } from "react";
import { MediaPickerField } from "@/components/media-picker-field";
import { AutoSlugField } from "@/components/auto-slug-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import { createEntryAction, type CreateEntryActionState } from "../actions";

const initialState: CreateEntryActionState = { error: null };

export function CreateEntryForm({
  contentTypes,
  categories,
}: {
  contentTypes: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createEntryAction, initialState);
  const [title, setTitle] = useState("");
  useActionToast({ pending, error: state.error });

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-muted-foreground">Título</label>
        <Input name="title" required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1" />
      </div>

      <AutoSlugField name="slug" sourceValue={title} label="Endereço da página" />

      <div>
        <label className="block text-xs font-medium text-muted-foreground">Tags</label>
        <div className="mt-1 space-y-2 rounded-md border border-border p-3">
          {contentTypes.map((contentType) => (
            <label key={contentType.id} className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" name="contentTypeIds" value={contentType.id} className="size-4" />
              {contentType.name}
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-muted-foreground/56">Selecione ao menos uma. Um conteúdo pode ter mais de uma tag.</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground">Privacidade</label>
        <Select name="visibility" defaultValue="public">
          <SelectTrigger className="mt-1 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Aberto (qualquer visitante)</SelectItem>
            <SelectItem value="authenticated">Fechado (só logados)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground">Categoria (opcional)</label>
        <Select name="categoryId">
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="nenhuma" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground">Corpo</label>
        <Textarea name="body" rows={8} className="mt-1" />
      </div>

      <MediaPickerField name="mediaId" />

      <Button type="submit" disabled={pending}>
        Criar conteúdo
      </Button>
    </form>
  );
}
