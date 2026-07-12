"use client";

import { BringToFront, Check, Lock, Pencil, SendToBack, Trash2, Unlock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function LayerContextMenu({
  isLocked,
  name,
  onClose,
  onDelete,
  onMoveToBack,
  onMoveToFront,
  onRename,
  onToggleLock,
  position
}: {
  isLocked: boolean;
  name: string;
  onClose: () => void;
  onDelete: () => void;
  onMoveToBack: () => void;
  onMoveToFront: () => void;
  onRename: (name: string) => void;
  onToggleLock: () => void;
  position: { x: number; y: number };
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [value, setValue] = useState(name);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onClose();
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [onClose]);

  const run = (action: () => void) => { action(); onClose(); };
  const menu = (
    <div ref={menuRef} className="fixed z-[110] w-60 overflow-hidden rounded-xl border border-white/10 bg-[#121216]/95 p-1.5 text-[13px] text-neutral-200 shadow-2xl backdrop-blur-xl" style={{ left: Math.min(position.x, window.innerWidth - 252), top: Math.min(position.y, window.innerHeight - 250) }}>
      {isRenaming ? (
        <form className="flex items-center gap-1 p-1" onSubmit={(event) => { event.preventDefault(); run(() => onRename(value)); }}>
          <input autoFocus className="h-8 min-w-0 flex-1 rounded-lg border border-[#8ea5ff]/50 bg-black/40 px-2 outline-none" onChange={(event) => setValue(event.target.value)} value={value} />
          <button className="grid h-8 w-8 place-items-center rounded-lg bg-[#8ea5ff] text-black" type="submit"><Check size={14} /></button>
        </form>
      ) : (
        <>
          <LayerMenuButton icon={Pencil} label="Rename layer" onClick={() => setIsRenaming(true)} />
          <LayerMenuButton icon={isLocked ? Unlock : Lock} label={isLocked ? "Unlock layer" : "Lock layer"} onClick={() => run(onToggleLock)} />
          <div className="my-1 h-px bg-white/[0.07]" />
          <LayerMenuButton icon={BringToFront} label="Bring to front" onClick={() => run(onMoveToFront)} />
          <LayerMenuButton icon={SendToBack} label="Send to back" onClick={() => run(onMoveToBack)} />
          <div className="my-1 h-px bg-white/[0.07]" />
          <LayerMenuButton danger icon={Trash2} label="Delete layer" onClick={() => run(onDelete)} />
        </>
      )}
    </div>
  );
  return typeof document === "undefined" ? null : createPortal(menu, document.body);
}

function LayerMenuButton({ danger = false, icon: Icon, label, onClick }: { danger?: boolean; icon: typeof Pencil; label: string; onClick: () => void }) {
  return <button className={`flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-left transition ${danger ? "text-red-300 hover:bg-red-500/10" : "hover:bg-white/[0.07] hover:text-white"}`} onClick={onClick} type="button"><Icon className="text-neutral-400" size={15} /><span>{label}</span></button>;
}
