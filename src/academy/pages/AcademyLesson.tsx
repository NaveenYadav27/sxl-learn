import { useParams, Link } from "react-router-dom";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLesson } from "../data/lessons";
import { LessonRuntimeProvider } from "../components/runtime";
import { LessonShell } from "../components/LessonShell";

export function AcademyLesson() {
  const { id } = useParams<{ id: string }>();
  const lesson = getLesson(id);

  if (!lesson) {
    return (
      <div className="container py-16 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-2xl font-bold">Lesson Not Found</h2>
        <p className="text-muted-foreground text-sm">
          Could not locate lesson identifier &quot;{id}&quot;.
        </p>
        <Link to="/ops/academy">
          <Button variant="outline" className="gap-2">
            <ChevronLeft className="h-4 w-4" /> Return to Academy Curriculum
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <LessonRuntimeProvider lesson={lesson}>
      <LessonShell />
    </LessonRuntimeProvider>
  );
}
