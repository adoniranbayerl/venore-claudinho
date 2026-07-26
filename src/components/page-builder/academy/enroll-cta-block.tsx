import Link from "next/link";
import type { Block } from "@/contexts/cms";
import { getCourseForStudent, isEnrolled } from "@/plugins/academy";
import { Button } from "@/components/ui/button";
import { AcademyEnrollButton } from "./enroll-button";

function readString(data: Block["data"], key: string, fallback = ""): string {
  const value = data[key];
  return typeof value === "string" ? value : fallback;
}

export async function AcademyEnrollCtaBlock({ data }: { data: Block["data"] }) {
  const slug = readString(data, "slug").trim();
  if (!slug) {
    return null;
  }
  const label = readString(data, "label", "Matricular-se");

  const courseResult = await getCourseForStudent({ slug });
  if (!courseResult.success || !courseResult.data) {
    return null;
  }
  const course = courseResult.data;

  const enrolledResult = await isEnrolled({ courseId: course.id });
  if (!enrolledResult.success) {
    // Visitante anônimo: manda pra página do curso, que já sabe pedir login (gracioso, sem
    // duplicar a lógica de auth aqui).
    return (
      <Button asChild>
        <Link href={`/academy/${course.slug}`}>{label}</Link>
      </Button>
    );
  }

  if (enrolledResult.data) {
    return (
      <Button asChild>
        <Link href={`/academy/${course.slug}`}>Continuar curso</Link>
      </Button>
    );
  }

  if (!course.selfEnrollmentEnabled) {
    return (
      <Button asChild variant="outline">
        <Link href={`/academy/${course.slug}`}>Ver curso</Link>
      </Button>
    );
  }

  return <AcademyEnrollButton courseId={course.id} slug={course.slug} label={label} />;
}
