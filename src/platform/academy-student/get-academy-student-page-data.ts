import { getCurrentUser } from "@/contexts/auth";
import type { AcademyStudentPageGate } from "./types";

// Loader compartilhado por seção (docs/venore-docks.md — regra 13): qualquer página de
// /academy/** chama isto antes de renderizar. Diferente de getAdminPageData, aqui não existe
// permission — só autenticação (qualquer ator logado acessa qualquer curso publicado, decisão já
// registrada no plano desta sessão).
export async function getAcademyStudentPageData(): Promise<AcademyStudentPageGate> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return { granted: false, reason: "unauthenticated" };
  }

  return {
    granted: true,
    actor: { id: currentUser.data.id, name: currentUser.data.name, email: currentUser.data.email },
  };
}
