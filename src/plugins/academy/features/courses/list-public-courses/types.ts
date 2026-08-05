import type { OperationResult } from "@/shared/types";
import type { CourseRecord } from "../../../contracts/types";

// Sem query — usado pela vitrine pública (pedido desta sessão: "landing page pra vender os
// cursos"), acessível a visitante anônimo, então não recebe nem depende de actorId.
export type ListPublicCoursesResult = OperationResult<CourseRecord[]>;
