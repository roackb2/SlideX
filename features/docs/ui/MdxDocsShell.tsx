"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/common/lib/I18nProvider";
import { MdxDocsContent } from "@/features/docs/ui/MdxDocsContent";
import { MdxDocsFooterCta } from "@/features/docs/ui/MdxDocsFooterCta";
import { MdxDocsHeader } from "@/features/docs/ui/MdxDocsHeader";
import { DesktopDocsSidebar, MobileDocsNav } from "@/features/docs/ui/MdxDocsNavigation";
import {
  buildDocSections,
  buildDocsGroups,
  getSectionBody,
  type MdxDocsSection
} from "@/features/docs/ui/mdxDocsModel";

export type { MdxDocsSection } from "@/features/docs/ui/mdxDocsModel";

export default function MdxDocsShell({ section }: { section: MdxDocsSection }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(true);
  const { t } = useI18n();
  const syntax = t.resourcesPage.syntax;
  const docSections = useMemo(() => buildDocSections(syntax), [syntax]);
  const docsGroups = useMemo(() => buildDocsGroups(syntax, docSections, section), [docSections, section, syntax]);
  const currentIndex = docSections.findIndex((item) => item.id === section);
  const currentSection = docSections[currentIndex] ?? docSections[0];
  const nextSection = docSections[currentIndex + 1];
  const nextHref = nextSection?.href ?? "/studio";
  const nextTitle = nextSection?.label ?? syntax.ctaTitle;
  const nextBody = nextSection ? getSectionBody(nextSection.id, syntax) : syntax.ctaBody;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-neutral-200 relative z-0">
      {/* Background Mesh (Ethereal Blue Light) */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] h-[70vw] w-[70vw] rounded-full bg-[#1e3a8a]/20 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[20%] -right-[20%] h-[60vw] w-[60vw] rounded-full bg-[#0369a1]/15 blur-[120px] mix-blend-screen" />
        <div className="absolute -bottom-[20%] left-[10%] h-[80vw] w-[80vw] rounded-full bg-[#312e81]/20 blur-[130px] mix-blend-screen" />
        <div className="absolute top-[10%] left-[20%] h-[300px] w-[500px] rounded-full bg-[#38bdf8]/10 blur-[80px] mix-blend-screen" />
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}
        />
      </div>
      <section className="px-4 pt-24 sm:px-6">
        <div className="mx-auto grid w-full max-w-[1112px] gap-0 lg:grid-cols-[220px_minmax(0,820px)] lg:gap-8 xl:gap-10">
          <DesktopDocsSidebar docsGroups={docsGroups} />

          <div className="min-w-0">
            <MdxDocsHeader
              currentSection={currentSection}
              resourcesLabel={t.nav.resources}
              section={section}
              syntax={syntax}
            />

            <article className="py-8">
              <MobileDocsNav
                currentSection={currentSection}
                docsGroups={docsGroups}
                isMobileNavOpen={isMobileNavOpen}
                setIsMobileNavOpen={setIsMobileNavOpen}
              />

              <MdxDocsContent section={section} syntax={syntax} />

              <MdxDocsFooterCta
                nextBody={nextBody}
                nextHref={nextHref}
                nextTitle={nextTitle}
                syntax={syntax}
              />
            </article>
          </div>
        </div>
      </section>    </main>
  );
}
