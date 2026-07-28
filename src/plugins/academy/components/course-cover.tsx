import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

// Curso ainda não tem campo de capa no domínio (CourseRecord não expõe mediaId — sem migration
// nesta sessão, que é só apresentação). Placeholder visual só com tokens semânticos até essa
// mudança de domínio existir.
export function CourseCover({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex aspect-[16/9] w-full items-center justify-center rounded-panel bg-(image:--sidebar-bg) text-muted-foreground/56",
        className,
      )}
    >
      <BookOpen className="size-8" strokeWidth={1.5} />
    </div>
  );
}
