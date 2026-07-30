import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseCover } from "./course-cover";
import type { CourseRecord } from "@/plugins/academy";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

export function AdminCourseCard({ course, lessonCount }: { course: CourseRecord; lessonCount: number }) {
  const isPublished = course.status === "published";

  return (
    <Link href={`/admin/academy/courses/${course.id}`} className="group block">
      <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow group-hover:shadow-float">
        <CourseCover coverMediaId={course.coverMediaId} className="rounded-b-none" />
        <CardHeader className="gap-2 pt-4">
          <Badge variant={isPublished ? "default" : "secondary"} className="w-fit">
            {isPublished ? "Publicado" : "Rascunho"}
          </Badge>
          <CardTitle className="text-base">{course.title}</CardTitle>
          <p className="text-[11px] font-medium tracking-caps text-muted-foreground/56 uppercase">
            {lessonCount} {lessonCount === 1 ? "aula" : "aulas"} · criado em {dateFormatter.format(course.createdAt)}
          </p>
        </CardHeader>
        {course.description && (
          <CardContent className="pb-4">
            <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
