import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { OfficialTemplate } from "@/features/workspace/domain/officialTemplate";
import { workspacePresentationCoverPath } from "@/features/workspace/ui/workspacePresentationCovers";
import { useWorkspaceI18n } from "@/features/workspace/ui/workspaceI18n";

type WorkspaceOfficialTemplateCardProps = {
  isDisabled: boolean;
  isCreating: boolean;
  onUse: () => void;
  template: OfficialTemplate;
};

function safeTemplateCoverPath(template: OfficialTemplate) {
  const knownCover = workspacePresentationCoverPath(template.id);
  if (knownCover) return knownCover;
  return template.thumbnailUrl?.startsWith("/") ? template.thumbnailUrl : null;
}

export function WorkspaceOfficialTemplateCard({ isCreating, isDisabled, onUse, template }: WorkspaceOfficialTemplateCardProps) {
  const { tx } = useWorkspaceI18n();
  const coverPath = safeTemplateCoverPath(template);

  return (
    <article className="group [contain-intrinsic-size:auto_390px] [content-visibility:auto]">
      <button
        className="block w-full rounded-[12px] border border-white/[0.085] bg-[#1b1b1b] p-2 text-left transition duration-200 hover:border-white/[0.16] hover:bg-[#1e1e1e] active:scale-[0.995] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/10 disabled:cursor-wait disabled:opacity-60"
        disabled={isDisabled}
        onClick={onUse}
        type="button"
      >
        <div className="relative aspect-video overflow-hidden rounded-[10px] bg-[#242424]">
          {coverPath ? (
            <>
              <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-white/[0.04]" />
              <Image
                alt={`${template.name} cover`}
                className="object-cover transition duration-500 group-hover:scale-[1.02]"
                decoding="async"
                fill
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                src={coverPath}
              />
            </>
          ) : (
            <div className="flex h-full flex-col justify-between bg-[#272727] p-[8%]">
              <Image alt="SlideX" className="h-auto w-[20%] object-contain opacity-45" decoding="async" height={72} loading="lazy" src="/logo.png" width={260} />
              <span className="max-w-[78%] text-[clamp(15px,1.8vw,24px)] font-medium leading-[0.98] tracking-[-0.04em] text-white/86">{template.name}</span>
            </div>
          )}
          <span className="absolute right-2.5 top-2.5 inline-flex h-7 items-center gap-1 rounded-[6px] border border-white/[0.1] bg-[#151515]/82 px-2 text-[10px] font-medium text-white/74 opacity-0 backdrop-blur-md transition group-hover:opacity-100 group-focus-within:opacity-100">
            {tx(isCreating ? "Creating…" : "Use template")}
            <ArrowUpRight className="h-3 w-3" strokeWidth={1.8} />
          </span>
        </div>
        <span className="flex min-h-[72px] items-start justify-between gap-4 px-2 pb-2 pt-2.5">
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-medium leading-5 tracking-[-0.01em] text-white/84 transition group-hover:text-white">{template.name}</span>
            <span className="mt-1 line-clamp-2 block text-[11px] leading-4 text-white/34">{template.description}</span>
          </span>
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] border border-white/[0.08] text-white/34 transition group-hover:border-white/[0.16] group-hover:text-white/72">
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.7} />
          </span>
        </span>
      </button>
    </article>
  );
}
