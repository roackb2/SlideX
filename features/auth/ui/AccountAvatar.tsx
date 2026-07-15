"use client";

import { useEffect, useState } from "react";

type AccountAvatarProps = {
  avatarUrl?: string;
  displayName: string;
  size?: "compact" | "default" | "profile" | "small";
};

export function AccountAvatar({ avatarUrl, displayName, size = "default" }: AccountAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [avatarUrl]);

  const sizeClass = size === "small"
    ? "h-6 w-6 rounded-[6px]"
    : size === "compact"
      ? "h-8 w-8 rounded-[7px]"
      : size === "profile"
        ? "h-16 w-16 rounded-[16px]"
        : "h-11 w-11 rounded-[10px]";
  const fallbackTextClass = size === "profile" ? "text-[18px]" : "text-[12px]";

  if (avatarUrl && !imageFailed) {
    return (
      <img
        alt={`${displayName} account photo`}
        className={`${sizeClass} shrink-0 bg-white/[0.06] object-cover ring-1 ring-inset ring-white/[0.12]`}
        onError={() => setImageFailed(true)}
        referrerPolicy="no-referrer"
        src={avatarUrl}
      />
    );
  }

  return (
    <div
      aria-label={`${displayName} account photo fallback`}
      className={`${sizeClass} ${fallbackTextClass} flex shrink-0 items-center justify-center bg-[#f1f0eb] font-semibold uppercase text-[#191919] ring-1 ring-inset ring-black/5`}
      role="img"
    >
      {displayName.trim().charAt(0) || "S"}
    </div>
  );
}
