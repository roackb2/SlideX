import type { ReactNode } from "react";
import type { Locale } from "@/common/lib/i18n";
import type { AppearanceMode } from "@/features/briefly/infrastructure/builderAppearance";
import { getBrieflyCopy } from "@/features/briefly/ui/brieflyCopy";
import { Languages, Monitor, Moon, Settings, Sun } from "lucide-react";

interface BuilderPreferencesPanelProps {
  appearanceMode: AppearanceMode;
  locale: Locale;
  onAppearanceModeChange: (mode: AppearanceMode) => void;
  onLocaleChange: (locale: Locale) => void;
}

export function BuilderPreferencesPanel({
  appearanceMode,
  locale,
  onAppearanceModeChange,
  onLocaleChange
}: BuilderPreferencesPanelProps) {
  const copy = getBrieflyCopy(locale).builder.preferences;
  const appearanceOptions = [
    { value: "system" as const, label: copy.system, icon: <Monitor className="h-3.5 w-3.5" /> },
    { value: "dark" as const, label: copy.dark, icon: <Moon className="h-3.5 w-3.5" /> },
    { value: "light" as const, label: copy.light, icon: <Sun className="h-3.5 w-3.5" /> }
  ];
  const languageOptions = [
    { value: "zh-TW" as const, label: copy.zhTw },
    { value: "en" as const, label: copy.english }
  ];

  return (
    <div className="grid gap-7">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70">
          <Settings className="h-4 w-4" />
        </span>
        <h2 className="text-sm font-medium text-white/90">{copy.title}</h2>
      </div>

      <PreferenceSection icon={<Monitor className="h-4 w-4" />} title={copy.appearance}>
        <div className="grid grid-cols-3 gap-1 rounded-lg border border-white/[0.08] bg-[#0a0a0a] p-1">
          {appearanceOptions.map((option) => (
            <PreferenceButton
              key={option.value}
              active={appearanceMode === option.value}
              icon={option.icon}
              label={option.label}
              onClick={() => onAppearanceModeChange(option.value)}
            />
          ))}
        </div>
      </PreferenceSection>

      <PreferenceSection icon={<Languages className="h-4 w-4" />} title={copy.language}>
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-white/[0.08] bg-[#0a0a0a] p-1">
          {languageOptions.map((option) => (
            <PreferenceButton
              key={option.value}
              active={locale === option.value}
              label={option.label}
              onClick={() => onLocaleChange(option.value)}
            />
          ))}
        </div>
      </PreferenceSection>
    </div>
  );
}

function PreferenceSection({
  children,
  icon,
  title
}: {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section className="grid gap-3">
      <div className="flex items-center gap-2 px-1">
        <span className="text-white/50">{icon}</span>
        <p className="text-[11px] font-medium tracking-wider text-white/60">{title}</p>
      </div>
      {children}
    </section>
  );
}

function PreferenceButton({
  active,
  icon,
  label,
  onClick
}: {
  active: boolean;
  icon?: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 text-xs font-medium transition-all duration-200 ${
        active
          ? "briefly-segment-active bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.24)]"
          : "text-white/60 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
