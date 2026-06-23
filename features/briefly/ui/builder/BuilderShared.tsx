import type { ReactNode } from "react";

export function ExportAction({
  label,
  icon,
  onClick
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-12 items-center gap-3 rounded-lg border border-white/10 bg-[#0a0a0a] px-4 text-left text-sm font-medium text-white/70 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.04] hover:text-white"
    >
      {icon}
      {label}
    </button>
  );
}

export function PanelHeader({
  icon,
  title,
  body
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/50">
          {icon}
        </span>
        <h2 className="text-sm font-medium text-white/90">{title}</h2>
      </div>
      <p className="text-[11px] leading-5 text-white/60">{body}</p>
    </div>
  );
}

export function SegmentButton({
  active,
  onClick,
  children,
  icon
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-7 items-center justify-center gap-1.5 rounded-md px-3 text-[11px] font-medium transition-all duration-300 ${
        active
          ? "briefly-segment-active bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]"
          : "text-white/60 hover:text-white/70"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

export function IconButton({
  label,
  disabled,
  onClick,
  children
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/[0.02] text-white/60 transition-all duration-200 hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
    >
      {children}
    </button>
  );
}
