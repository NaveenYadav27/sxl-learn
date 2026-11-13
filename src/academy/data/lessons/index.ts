import type { Lesson } from "../../types";
import { LESSON_01 } from "./lesson01";
import { LESSON_02 } from "./lesson02";
import { LESSON_03 } from "./lesson03";
import { LESSON_04 } from "./lesson04";
import { LESSON_05 } from "./lesson05";
import { LESSON_06 } from "./lesson06";
import { LESSON_07 } from "./lesson07";
import { LESSON_08 } from "./lesson08";
import { LESSON_09 } from "./lesson09";
import { LESSON_10 } from "./lesson10";

export const LESSONS: Lesson[] = [
  LESSON_01,
  LESSON_02,
  LESSON_03,
  LESSON_04,
  LESSON_05,
  LESSON_06,
  LESSON_07,
  LESSON_08,
  LESSON_09,
  LESSON_10,
];

export const LESSONS_BY_ID: Record<string, Lesson> = Object.fromEntries(
  LESSONS.map((l) => [l.id, l])
);

export function getLesson(id: string | undefined): Lesson | undefined {
  if (!id) return undefined;
  // Support both "l01" and "1" or "01"
  if (LESSONS_BY_ID[id]) return LESSONS_BY_ID[id];
  const num = parseInt(id.replace(/\D/g, ""), 10);
  if (!isNaN(num)) {
    return LESSONS.find((l) => l.number === num);
  }
  return undefined;
}

export {
  LESSON_01,
  LESSON_02,
  LESSON_03,
  LESSON_04,
  LESSON_05,
  LESSON_06,
  LESSON_07,
  LESSON_08,
  LESSON_09,
  LESSON_10,
};
