export type AcademyStudentActor = {
  id: string;
  name: string | null;
  email: string | null;
};

export type AcademyStudentPageGate =
  | { granted: true; actor: AcademyStudentActor }
  | { granted: false; reason: "unauthenticated" };

export type AcademyCourseAccessCourse = {
  id: string;
  title: string;
  description: string | null;
  selfEnrollmentEnabled: boolean;
};

// Camada de acesso por curso, além do gate de seção (AcademyStudentPageGate): matrícula,
// self-enrollment e preview de professor (docs/venore-docks.md, plano da sessão de matrícula).
export type AcademyCourseAccess =
  | { mode: "unauthenticated" }
  | { mode: "not-found" }
  | { mode: "restricted"; course: AcademyCourseAccessCourse }
  | { mode: "enroll-available"; actor: AcademyStudentActor; course: AcademyCourseAccessCourse }
  | { mode: "preview"; actor: AcademyStudentActor; course: AcademyCourseAccessCourse }
  | { mode: "full"; actor: AcademyStudentActor; course: AcademyCourseAccessCourse };
