-- Reset all in-flight and completed lab progress so users can re-try labs
DELETE FROM public.question_responses;
DELETE FROM public.step_progress;
DELETE FROM public.lab_attempts;