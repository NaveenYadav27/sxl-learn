import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { COURSES, COURSE_LIST, DEFAULT_COURSE, type CourseCode, type CourseDefinition } from "@/lib/courses";

const STORAGE_KEY = "shadowx.activeCourse";

type CourseContextValue = {
  courseCode: CourseCode;
  course: CourseDefinition;
  setCourseCode: (code: CourseCode) => void;
  courses: CourseDefinition[];
};

const CourseContext = createContext<CourseContextValue | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [courseCode, setCourseCodeState] = useState<CourseCode>(() => {
    if (typeof window === "undefined") return DEFAULT_COURSE;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return (stored && stored in COURSES ? (stored as CourseCode) : DEFAULT_COURSE);
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, courseCode);
    } catch {
      /* ignore */
    }
  }, [courseCode]);

  const value = useMemo<CourseContextValue>(
    () => ({
      courseCode,
      course: COURSES[courseCode],
      setCourseCode: (code) => setCourseCodeState(code),
      courses: COURSE_LIST,
    }),
    [courseCode],
  );

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

export function useCourse(): CourseContextValue {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourse must be used within a CourseProvider");
  return ctx;
}
