"use client";

import { useState } from "react";
import { columnLabel, createTableCells, serializeTableCells } from "@/core/motion-doc/application/tableBlock";
import type { AddBlockOptions } from "@/features/pitch/application/motionDocCommands";
import type { AddBlockType } from "@/features/pitch/ui/pitchOptions";

const tableGridSize = 10;

export function TableToolbox({
  onAddTool
}: {
  onAddTool: (type: AddBlockType, options?: AddBlockOptions) => void;
}) {
  const [hoveredSize, setHoveredSize] = useState({ columns: 1, rows: 1 });

  function resetGrid() {
    setHoveredSize({ columns: 1, rows: 1 });
  }

  function addTable(rows: number, columns: number) {
    onAddTool("Table", {
      props: {
        cells: serializeTableCells(createTableCells(rows, columns)),
        background: "#ffffff",
        borderColor: "#d1d5db",
        borderWidth: 1,
        cellBackground: "#ffffff",
        columnLabels: Array.from({ length: columns }, (_, index) => columnLabel(index)).join(","),
        columns,
        color: "#000000",
        fontSize: 16,
        h: tableHeight(rows),
        rowLabels: Array.from({ length: rows }, (_, index) => String(index + 1)).join(","),
        rows,
        stripeBackground: "#f8fafc",
        w: tableWidth(columns)
      }
    });
  }

  return (
    <div className="absolute bottom-[4.25rem] left-1/2 z-[60] w-[272px] -translate-x-1/2 rounded-2xl border border-white/[0.08] bg-neutral-950/95 p-3 shadow-[0_24px_60px_rgba(0,0,0,0.78)] backdrop-blur-2xl sm:bottom-[5rem]">
      <div className="mb-2 flex items-center justify-between px-0.5">
        <span className="text-[11px] font-semibold text-neutral-200">Table size</span>
        <button className="text-[10px] text-neutral-500 transition-colors hover:text-neutral-300" onClick={resetGrid} type="button">Reset grid</button>
      </div>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: tableGridSize }).map((_, rowIndex) =>
          Array.from({ length: tableGridSize }).map((__, columnIndex) => {
            const rows = rowIndex + 1;
            const columns = columnIndex + 1;
            const isActive = rows <= hoveredSize.rows && columns <= hoveredSize.columns;

            return (
              <button
                aria-label={`Insert ${columns} by ${rows} table`}
                className={`aspect-square rounded-[4px] border transition-all ${
                  isActive
                    ? "border-pink-300/80 bg-pink-400/55 shadow-[0_0_8px_rgba(244,114,182,0.18)]"
                    : "border-white/[0.12] bg-white/[0.035] hover:border-pink-300/70"
                }`}
                key={`${rows}-${columns}`}
                onClick={() => addTable(rows, columns)}
                onMouseEnter={() => setHoveredSize({ columns, rows })}
                type="button"
              />
            );
          })
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px]">
        <span className="text-neutral-500">Move to extend selection</span>
        <span className="font-semibold text-pink-200">{hoveredSize.columns} × {hoveredSize.rows}</span>
      </div>
    </div>
  );
}

function tableWidth(columns: number) {
  return Math.min(82, Math.max(38, 20 + columns * 6));
}

function tableHeight(rows: number) {
  return Math.min(62, Math.max(24, 14 + rows * 5));
}
