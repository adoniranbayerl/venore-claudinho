import { getCurrentUser } from "@/contexts/auth";
import { getUserContext } from "@/contexts/rbac";
import { getCourseForStudent, isEnrolled } from "@/plugins/academy";
import type { AcademyCourseAccess } from "./types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Composição academy + rbac + auth (papel de platform/, docs/venore-docks.md regra 12) — decide
// o nível de acesso a UM curso específico, camada adicional sobre getAcademyStudentPageData()
// (que só checa autenticação, regra 13). Preview de professor exige academy.courses.manage E
// ser o criador do curso (ou isSuperadmin) — RBAC nesta v1 é só permission global, sem escopo por
// recurso, então comparamos createdBy diretamente em vez de introduzir RBAC por recurso.
export async function getAcademyCourseAccess({ courseSlug }: { courseSlug: string }): Promise<AcademyCourseAccess> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return { mode: "unauthenticated" };
  }
  const actor = { id: currentUser.data.id, name: currentUser.data.name, email: currentUser.data.email };

  const courseResult = await getCourseForStudent({ slug: courseSlug });
  // Rotas antigas usavam o id (UUID) do curso na URL — se não achar por slug e a string parecer
  // um UUID, tenta resolver pelo id legado só pra decidir o redirect (item 2 do pedido da sessão:
  // "/academy/<uuid antigo> redireciona").
  if ((!courseResult.success || !courseResult.data) && UUID_PATTERN.test(courseSlug)) {
    const byId = await getCourseForStudent({ id: courseSlug });
    if (byId.success && byId.data) {
      return { mode: "redirect", slug: byId.data.slug };
    }
  }

  if (!courseResult.success || !courseResult.data) {
    return { mode: "not-found" };
  }
  const course = {
    id: courseResult.data.id,
    slug: courseResult.data.slug,
    title: courseResult.data.title,
    description: courseResult.data.description,
    selfEnrollmentEnabled: courseResult.data.selfEnrollmentEnabled,
  };

  const enrolledResult = await isEnrolled({ courseId: course.id });
  if (enrolledResult.success && enrolledResult.data) {
    return { mode: "full", actor, course };
  }

  const rbacContext = await getUserContext({ userId: actor.id });
  const canPreview =
    rbacContext.success &&
    (rbacContext.data.isSuperadmin ||
      (rbacContext.data.permissions.includes("academy.courses.manage") && courseResult.data.createdBy === actor.id));
  if (canPreview) {
    return { mode: "preview", actor, course };
  }

  if (course.selfEnrollmentEnabled) {
    return { mode: "enroll-available", actor, course };
  }

  return { mode: "restricted", course };
}
