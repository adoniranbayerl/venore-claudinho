import type { OperationResult } from "@/shared/types";
import { MUSICA_LESSONS } from "./jesus-cristo-mudou-meu-viver.lessons";
import { runCourseSeed } from "./shared/course-builder";

// Curso da música "Jesus Cristo mudou meu viver" em Lá maior — conteúdo completo em
// docs/curso-jesus-cristo-mudou-meu-viver.md. A melodia/2ª voz nos exemplos são um MODELO plausível
// em Lá maior; o dono ajusta contra a própria gravação de referência (Aula 1).

export function seedAcademyJesusCristoMudouMeuViver(): Promise<OperationResult<void>> {
  return runCourseSeed(
    {
      slug: "jesus-cristo-mudou-meu-viver",
      title: "Jesus Cristo mudou meu viver — anatomia de uma música",
      description:
        "Uma música só, do começo ao fim: de onde ela vem, em que andamento anda, como a bateria segura " +
        "o groove, como a melodia se move, como a harmonia é construída e como criar a segunda voz e o " +
        "arranjo. Em Lá maior. Os exemplos de partitura são um modelo — ajuste à sua gravação de referência.",
      actorId: "system-seed",
    },
    MUSICA_LESSONS,
  );
}
