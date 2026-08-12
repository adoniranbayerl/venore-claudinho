export { enrollmentDashboardBreadcrumbSegments } from "./breadcrumbs";
export { getMockEnrollmentDashboardData } from "./shared/mock-data";
export { totalEnrollments, goalCompletionRatio, goalStatus } from "./shared/enrollment-metrics";
export { getPresentationAccessHandler as getPresentationAccess } from "./features/get-presentation-access/handler";

export { EnrollmentDashboardView } from "./components/enrollment-dashboard-view";
export { EnrollmentColumnsSlide } from "./components/enrollment-columns-slide";
export { PresentationCanvas } from "./components/presentation-canvas";

export type { EnrollmentInstitution, EnrollmentProgramMetrics, EnrollmentGoalStatus } from "./contracts/types";
export type { PresentationAccess, GetPresentationAccessResult } from "./features/get-presentation-access/types";
