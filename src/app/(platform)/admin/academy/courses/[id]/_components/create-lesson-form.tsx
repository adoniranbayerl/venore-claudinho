"use client";

import { useActionState, useState } from "react";
import { MediaPickerField } from "@/components/media-picker-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import { createLessonAction, type CourseActionState } from "../actions";

const initialState: CourseActionState = { error: null };

export function CreateLessonForm({
  courseId,
  entries,
}: {
  courseId: string;
  entries: { id: string; title: string; slug: string }[];
}) {
  const [state, formAction, pending] = useActionState(createLessonAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Aula criada." });
  const [videoUrl, setVideoUrl] = useState("");
  const [quizEnabled, setQuizEnabled] = useState(false);

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <input type="hidden" name="courseId" value={courseId} />

      <div>
        <label className="block text-xs font-medium text-muted-foreground">Conteúdo do CMS</label>
        <Select name="cmsEntryId" required>
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="selecione..." />
          </SelectTrigger>
          <SelectContent>
            {entries.map((entry) => (
              <SelectItem key={entry.id} value={entry.id}>
                {entry.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {entries.length === 0 && (
          <p className="mt-1 text-xs text-muted-foreground/56">Nenhum conteúdo publicado no CMS ainda.</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground">URL do vídeo (opcional)</label>
        <Input name="videoUrl" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} className="mt-1" />
      </div>

      <MediaPickerField name="coverMediaId" label="Capa da aula (opcional)" />

      <div className="space-y-2 border-t border-border pt-3">
        <p className="text-xs font-medium text-muted-foreground">Requisitos de conclusão (opcional, dá pra ajustar depois)</p>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            name="readTextEnabled"
            className="rounded-sm outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
          />
          Exigir leitura do texto
        </label>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            name="watchVideoEnabled"
            disabled={videoUrl.trim().length === 0}
            className="rounded-sm outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
          />
          Exigir assistir o vídeo
          {videoUrl.trim().length === 0 && <span className="text-xs text-muted-foreground/56">(preencha a URL do vídeo)</span>}
        </label>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            name="quizEnabled"
            checked={quizEnabled}
            onChange={(event) => setQuizEnabled(event.target.checked)}
            className="rounded-sm outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
          />
          Exigir quiz
        </label>

        {quizEnabled && (
          <div className="ml-6 space-y-3 border-l border-border pl-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Nota mínima para aprovação (%)</label>
              <Input type="number" name="quizPassThresholdPercent" min={1} max={100} defaultValue={70} className="mt-1" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Tentativas máximas</label>
              <Input type="number" name="quizMaxAttempts" min={1} defaultValue={3} className="mt-1" />
            </div>
            <p className="text-xs text-muted-foreground/56">
              As perguntas do quiz são cadastradas na página da aula depois de criá-la.
            </p>
          </div>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        Criar aula
      </Button>
    </form>
  );
}
