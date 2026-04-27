import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  TERMS_BRAND,
  TERMS_EFFECTIVE,
  TERMS_SECTIONS,
  TERMS_SITE,
  TIERS,
} from "@/lib/terms";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            {TERMS_BRAND}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-14">
        {/* Title block */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Terms &amp; Conditions
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            For short-format paid courses (1H · 2H · 4H · 8H)
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {TERMS_EFFECTIVE} · {TERMS_SITE}
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-[260px_1fr]">
          {/* TOC */}
          <aside className="md:sticky md:top-24 md:self-start">
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Table of Contents
              </h2>
              <nav>
                <ol className="space-y-2 text-sm">
                  {TERMS_SECTIONS.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="text-foreground/80 hover:text-primary transition-colors"
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
              <div className="mt-5 border-t border-border pt-4">
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link to="/auth">Back to enrollment</Link>
                </Button>
              </div>
            </Card>
          </aside>

          {/* Sections */}
          <article className="space-y-10">
            {TERMS_SECTIONS.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                  {s.title}
                </h2>
                <div className="space-y-4 text-[15px] leading-relaxed text-foreground/85">
                  {s.body.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {s.hasTierTable && (
                  <div className="mt-6 space-y-6">
                    <div className="overflow-x-auto rounded-lg border border-border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Tier</th>
                            <th className="px-4 py-3 font-semibold">Purpose</th>
                            <th className="px-4 py-3 font-semibold">Deliverables</th>
                            <th className="px-4 py-3 font-semibold">Access window</th>
                            <th className="px-4 py-3 font-semibold">Completion</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {TIERS.map((t) => (
                            <tr key={t.code} className="align-top">
                              <td className="px-4 py-3 font-semibold text-foreground">
                                {t.code}
                              </td>
                              <td className="px-4 py-3 text-foreground/80">
                                {t.purpose}
                              </td>
                              <td className="px-4 py-3 text-foreground/80">
                                <ul className="list-disc space-y-1 pl-4">
                                  {t.deliverables.map((d) => (
                                    <li key={d}>{d}</li>
                                  ))}
                                </ul>
                              </td>
                              <td className="px-4 py-3 text-foreground/80">
                                {t.accessWindow}
                              </td>
                              <td className="px-4 py-3 text-foreground/80">
                                {t.completion}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div>
                      <p className="mb-2 text-[15px] text-foreground/85">
                        Each tier also carries the following completion-related notes:
                      </p>
                      <ul className="space-y-1 pl-5 text-[15px] list-disc text-foreground/80">
                        {TIERS.map((t) => (
                          <li key={t.code}>
                            <span className="font-semibold text-foreground">
                              {t.code}
                            </span>{" "}
                            · {t.eligibility}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </section>
            ))}
          </article>
        </div>

        <footer className="mt-16 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {TERMS_BRAND}. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
