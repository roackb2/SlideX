"use client";

import { useState } from "react";
import { columnLabel, createTableCells, serializeTableCells } from "@/core/motion-doc/application/tableBlock";
import type { AddBlockOptions } from "@/features/pitch/application/motionDocCommands";
import type { AddBlockType } from "@/features/pitch/ui/pitchOptions";

const maxTableGridSize = 10;

export function TableToolbox({
  onAddTool
}: {
  onAddTool: (type: AddBlockType, options?: AddBlockOptions) => void;
}) {
  const [hoveredSize, setHoveredSize] = useState({ columns: 2, rows: 2 });

  function addTable(rows: number, columns: number) {
    onAddTool("Table", {
      props: {
        cells: serializeTableCells(createTableCells(rows, columns)),
        columnLabels: Array.from({ length: columns }, (_, index) => columnLabel(index)).join(","),
        columns,
        h: tableHeight(rows),
        rowLabels: Array.from({ length: rows }, (_, index) => String(index + 1)).join(","),
        rows,
        w: tableWidth(columns)
      }
    });
  }

  return (
    <div className="absolute bottom-[4.25rem] left-1/2 z-[60] w-[256px] -translate-x-1/2 rounded-xl border border-white/[0.06] bg-neutral-950/90 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:bottom-[5rem]">
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: maxTableGridSize }).map((_, rowIndex) =>
          Array.from({ length: maxTableGridSize }).map((__, columnIndex) => {
            const rows = rowIndex + 1;
            const columns = columnIndex + 1;
            const isActive = rows <= hoveredSize.rows && columns <= hoveredSize.columns;

            return (
              <button
                aria-label={`Insert ${columns} by ${rows} table`}
                className={`h-4 rounded-[4px] border transition-colors ${
                  isActive
                    ? "border-[#8ea5ff] bg-[#8ea5ff]/70"
                    : "border-white/[0.12] bg-white/[0.035] hover:border-[#8ea5ff]/70"
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
      <div className="mt-3 text-center text-[12px] font-medium text-neutral-300">
        Insert {hoveredSize.columns}x{hoveredSize.rows} table
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
