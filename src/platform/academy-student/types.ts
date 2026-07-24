export type AcademyStudentActor = {
  id: string;
  name: string | null;
  email: string | null;
};

export type AcademyStudentPageGate =
  | { granted: true; actor: AcademyStudentActor }
  | { granted: false; reason: "unauthenticated" };
