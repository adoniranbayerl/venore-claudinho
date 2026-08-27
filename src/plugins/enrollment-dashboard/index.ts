export { enrollmentDashboardBreadcrumbSegments } from "./breadcrumbs";
export { totalEnrollments, goalCompletionRatio, goalStatus } from "./shared/enrollment-metrics";
export { resolveEnrollmentRowDensity } from "./shared/enrollment-density";
export { getPresentationAccessHandler as getPresentationAccess } from "./features/get-presentation-access/handler";
export {
  getEnrollmentDashboardDataHandler as getEnrollmentDashboardData,
} from "./features/get-enrollment-dashboard-data/handler";

export { createInstitutionHandler as createInstitution } from "./features/institutions/create-institution/handler";
export { updateInstitutionHandler as updateInstitution } from "./features/institutions/update-institution/handler";
export { deleteInstitutionHandler as deleteInstitution } from "./features/institutions/delete-institution/handler";

export { createProgramHandler as createProgram } from "./features/programs/create-program/handler";

// Ponto de extensão "seeds" do plugin engine (platform/plugin-engine/plugin-seed-registry.ts) —
// dados de exemplo (Erasto Gaertner + Fidelis) populados via /admin/plugins.
export { enrollmentDashboardSeeds } from "./seeds";
export { updateProgramHandler as updateProgram } from "./features/programs/update-program/handler";
export { deleteProgramHandler as deleteProgram } from "./features/programs/delete-program/handler";

export { EnrollmentDashboardView } from "./components/enrollment-dashboard-view";
export { EnrollmentColumnsSlide } from "./components/enrollment-columns-slide";
export { EnrollmentSummarySlide } from "./components/enrollment-summary-slide";
export { PresentationCanvas } from "./components/presentation-canvas";

export type { EnrollmentInstitution, EnrollmentProgramMetrics, EnrollmentGoalStatus } from "./contracts/types";
export type { EnrollmentRowDensity } from "./shared/enrollment-density";
export type { PresentationAccess, GetPresentationAccessResult } from "./features/get-presentation-access/types";
export type { GetEnrollmentDashboardDataResult } from "./features/get-enrollment-dashboard-data/types";
export type { CreateInstitutionInput, CreateInstitutionResult } from "./features/institutions/create-institution/types";
export type { UpdateInstitutionInput, UpdateInstitutionResult } from "./features/institutions/update-institution/types";
export type { DeleteInstitutionInput, DeleteInstitutionResult } from "./features/institutions/delete-institution/types";
export type { CreateProgramInput, CreateProgramResult } from "./features/programs/create-program/types";
export type { UpdateProgramInput, UpdateProgramResult } from "./features/programs/update-program/types";
export type { DeleteProgramInput, DeleteProgramResult } from "./features/programs/delete-program/types";
