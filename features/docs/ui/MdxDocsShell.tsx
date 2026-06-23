"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/common/lib/I18nProvider";
import { BrieflyDocsContent } from "@/features/docs/ui/BrieflyDocsContent";
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
  const { t, localePath } = useI18n();
  const syntax = t.resourcesPage.syntax;
  const brieflyDocs = t.resourcesPage.brieflyDocs;
  const docSections = useMemo(
    () => buildDocSections(syntax, brieflyDocs).map((item) => ({ ...item, href: localePath(item.href) })),
    [localePath, syntax, brieflyDocs]
  );
  const docsGroups = useMemo(() => buildDocsGroups(syntax, docSections, section), [docSections, section, syntax]);
  const currentIndex = docSections.findIndex((item) => item.id === section);
  const currentSection = docSections[currentIndex] ?? docSections[0];
  const nextSection = docSections[currentIndex + 1];
  const nextHref = nextSection?.href ?? localePath("/studio");
  const nextTitle = nextSection?.label ?? syntax.ctaTitle;
  const nextBody = nextSection ? getSectionBody(nextSection.id, syntax, brieflyDocs) : syntax.ctaBody;

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-[#888] relative z-0 selection:bg-blue-500/30 selection:text-white">

      <section className="px-4 pt-24 sm:px-6">
        <div className="mx-auto grid w-full max-w-[1112px] gap-0 lg:grid-cols-[220px_minmax(0,820px)] lg:gap-12 xl:gap-16">
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

              {section.startsWith("briefly-") ? (
                <BrieflyDocsContent section={section} brieflyDocs={brieflyDocs} syntax={syntax} />
              ) : (
                <MdxDocsContent section={section} syntax={syntax} />
              )}

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
