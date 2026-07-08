"use client";

import { Minus, Paintbrush, Palette, SquareSlash, Type as TypeIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import type { MotionDocBlock } from "@/core/motion-doc/domain/motionDocParser";
import {
  clearTableSelection,
  deleteTableColumn,
  deleteTableRow,
  insertTableColumn,
  insertTableRow,
  parseColOverrides,
  parseRowOverrides,
  pasteTableClipboard,
  tableCellsFromProps,
  tableClipboardFromSelection,
  tableColumnLabelsFromProps,
  tableColumnTrackValuesFromProps,
  tableRowLabelsFromProps,
  tableRowTrackValuesFromProps,
  tableSizeFromProps,
  tableTrackTemplate,
  updateColOverride,
  updateRowOverride,
  updateTableColumnTrackValues,
  updateTableCell,
  updateTableRowTrackValues,
  type CellStyleOverride,
  type TableClipboard,
  type TableSelection
} from "@/core/motion-doc/application/tableBlock";
import { hexColorValue, uniqueColors } from "@/features/pitch/application/colorPalettes";
import { clearTableEditorSelectionProps } from "@/features/pitch/application/tableEditorSelection";
import { defaultColorPresets } from "@/features/pitch/ui/inspector/color/palettes";
import { useCustomSwatches } from "@/features/pitch/ui/inspector/color/useCustomSwatches";
import type { BlockUpdater } from "@/features/pitch/ui/pitchCommandTypes";
import { TableContextMenu } from "@/features/pitch/ui/preview/TableContextMenu";

export type TableBlock = {
  props: Record<string, string | number>;
  type: "Table";
};

type ContextMenuState = {
  position: { x: number; y: number };
  selection: TableSelection;
  target: TableMenuTarget;
};

type TableMenuTarget = {
  columnIndex?: number;
  rowIndex?: number;
};

type TableFrameEditorProps = {
  block: TableBlock;
  blockIndex: number;
  onSelectionChange?: (selection: TableSelection | null) => void;
  onSelectBlock: (index: number) => void;
  onUpdateBlock: BlockUpdater;
};

export function isTableBlock(block: MotionDocBlock): block is TableBlock {
  return block.type === "Table" && "props" in block;
}

export function TableFrameEditor({
  block,
  blockIndex,
  onSelectionChange,
  onSelectBlock,
  onUpdateBlock
}: TableFrameEditorProps) {
  const [selection, setSelection] = useState<TableSelection | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [clipboard, setClipboard] = useState<TableClipboard | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const latestPropsRef = useRef(block.props);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const { columns, rows } = tableSizeFromProps(block.props);
  const cells = tableCellsFromProps(block.props, rows, columns);
  const columnLabels = tableColumnLabelsFromProps(block.props, columns);
  const rowLabels = tableRowLabelsFromProps(block.props, rows);
  const columnTracks = tableColumnTrackValuesFromProps(block.props, columns);
  const rowTracks = tableRowTrackValuesFromProps(block.props, rows);
  const headerHeight = Math.max(22, numberFromProp(block.props.headerHeight, 26));
  const rowHeaderWidth = Math.max(28, numberFromProp(block.props.rowHeaderWidth, 34));
  const borderWidth = numberFromProp(block.props.borderWidth, 1);
  const colors = tableColors(block.props);
  const textAlign = tableTextAlign(block.props.textAlign);
  const verticalAlign = tableVerticalAlign(block.props.textVerticalAlign);
  const tableGridStyle: CSSProperties = {
    gridTemplateColumns: tableTrackTemplate(columnTracks),
    gridTemplateRows: tableTrackTemplate(rowTracks)
  };
  const columnHeaderStyle: CSSProperties = {
    gridTemplateColumns: tableTrackTemplate(columnTracks),
    height: headerHeight,
    left: 0,
    right: 0,
    top: -(headerHeight + 8)
  };
  const rowHeaderStyle: CSSProperties = {
    bottom: 0,
    gridTemplateRows: tableTrackTemplate(rowTracks),
    left: -(rowHeaderWidth + 10),
    top: 0,
    width: rowHeaderWidth
  };
  const baseCellStyle = tableCellStyle({
    borderColor: colors.border,
    borderWidth,
    fontSize: numberFromProp(block.props.fontSize, 18),
    textAlign,
    verticalAlign
  });

  useEffect(() => {
    latestPropsRef.current = cleanTableEditorProps(block.props);
  }, [block.props]);

  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  function closeContextMenu() {
    setContextMenu(null);
  }

  useEffect(() => {
    setSelection((current) => {
      if (!current) return current;
      if (current.kind === "row" && current.index >= rows) {
        onSelectionChangeRef.current?.(null);
        return null;
      }
      if (current.kind === "column" && current.index >= columns) {
        onSelectionChangeRef.current?.(null);
        return null;
      }
      return current;
    });
  }, [columns, rows]);

  useEffect(() => {
    if (!contextMenu) {
      return;
    }

    function closeMenu(event: globalThis.PointerEvent) {
      if (menuRef.current?.contains(event.target as Node)) {
        return;
      }

      setContextMenu(null);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setContextMenu(null);
      }
    }

    window.addEventListener("pointerdown", closeMenu);
    window.addEventListener("resize", closeContextMenu);
    window.addEventListener("scroll", closeContextMenu, true);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", closeMenu);
      window.removeEventListener("resize", closeContextMenu);
      window.removeEventListener("scroll", closeContextMenu, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [contextMenu]);

  function selectTablePart(nextSelection: TableSelection) {
    setSelection(nextSelection);
    onSelectionChangeRef.current?.(nextSelection);
    onSelectBlock(blockIndex);
    frameRef.current?.focus({ preventScroll: true });
  }

  function openContextMenu(
    event: MouseEvent<HTMLElement>,
    nextSelection: TableSelection,
    target: TableMenuTarget = tableMenuTargetFromSelection(nextSelection)
  ) {
    event.preventDefault();
    event.stopPropagation();
    selectTablePart(nextSelection);
    setContextMenu({
      position: clampedTableMenuPosition(event, canvasBoundaryRect(frameRef.current)),
      selection: nextSelection,
      target
    });
  }

  function openCellContextMenu(event: MouseEvent<HTMLElement>, rowIndex: number, columnIndex: number) {
    const nextSelection = selection?.kind === "column" && selection.index === columnIndex
      ? { index: columnIndex, kind: "column" as const }
      : { index: rowIndex, kind: "row" as const };

    openContextMenu(event, nextSelection, { columnIndex, rowIndex });
  }

  function stopFramePointer(event: PointerEvent<HTMLElement>) {
    event.stopPropagation();
  }

  const updateTableProps = useCallback(function updateTableProps(nextProps: Record<string, string | number>, transient = false) {
    const cleanProps = cleanTableEditorProps(nextProps);
    latestPropsRef.current = cleanProps;
    onUpdateBlock(blockIndex, cleanProps, undefined, transient ? { transient: true } : { skipReplay: true });
  }, [blockIndex, onUpdateBlock]);

  function updateCell(rowIndex: number, columnIndex: number, value: string, transient = true) {
    updateTableProps(updateTableCell(latestPropsRef.current, rowIndex, columnIndex, value), transient);
  }

  function updateSelectionStyle(currentSelection: TableSelection, patch: CellStyleOverride) {
    const baseProps = latestPropsRef.current;
    const nextProps = currentSelection.kind === "row"
      ? updateRowOverride(baseProps, currentSelection.index, patch)
      : updateColOverride(baseProps, currentSelection.index, patch);

    updateTableProps(nextProps);
  }

  function startTableTrackResize(currentSelection: TableSelection, event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    selectTablePart(currentSelection);

    const rect = frameRef.current?.getBoundingClientRect();
    const isColumn = currentSelection.kind === "column";
    const startTracks = isColumn ? columnTracks : rowTracks;
    const axisSize = isColumn ? rect?.width : rect?.height;
    const neighborIndex = currentSelection.index < startTracks.length - 1
      ? currentSelection.index + 1
      : currentSelection.index - 1;

    if (!axisSize || axisSize <= 0 || neighborIndex < 0) {
      return;
    }

    const handleElement = event.currentTarget;
    handleElement.setPointerCapture(event.pointerId);

    const resizeAxisSize = axisSize;
    const pointerId = event.pointerId;
    const startPosition = isColumn ? event.clientX : event.clientY;
    const totalTrack = trackTotal(startTracks);

    function nextPropsForPosition(clientPosition: number) {
      const deltaUnits = ((clientPosition - startPosition) / resizeAxisSize) * totalTrack;
      const nextTracks = resizeTrackPair(startTracks, currentSelection.index, neighborIndex, deltaUnits);
      return isColumn
        ? updateTableColumnTrackValues(latestPropsRef.current, nextTracks)
        : updateTableRowTrackValues(latestPropsRef.current, nextTracks);
    }

    function handlePointerMove(moveEvent: globalThis.PointerEvent) {
      if (moveEvent.pointerId !== pointerId) {
        return;
      }

      moveEvent.preventDefault();
      updateTableProps(nextPropsForPosition(isColumn ? moveEvent.clientX : moveEvent.clientY), true);
    }

    function handlePointerUp(upEvent: globalThis.PointerEvent) {
      if (upEvent.pointerId !== pointerId) {
        return;
      }

      upEvent.preventDefault();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      if (handleElement.hasPointerCapture(pointerId)) {
        handleElement.releasePointerCapture(pointerId);
      }
      updateTableProps(nextPropsForPosition(isColumn ? upEvent.clientX : upEvent.clientY), false);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  }

  const copySelection = useCallback(function copySelection(currentSelection: TableSelection) {
    const nextClipboard = tableClipboardFromSelection(latestPropsRef.current, currentSelection);
    setClipboard(nextClipboard);

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(nextClipboard.cells.join(currentSelection.kind === "row" ? "\t" : "\n"));
    }
  }, []);

  const clearSelectionContents = useCallback(function clearSelectionContents(currentSelection: TableSelection) {
    updateTableProps(clearTableSelection(latestPropsRef.current, currentSelection));
  }, [updateTableProps]);

  const cutSelectionContents = useCallback(function cutSelectionContents(currentSelection: TableSelection) {
    copySelection(currentSelection);
    clearSelectionContents(currentSelection);
  }, [clearSelectionContents, copySelection]);

  const deleteRowAt = useCallback(function deleteRowAt(rowIndex: number) {
    updateTableProps(deleteTableRow(latestPropsRef.current, rowIndex));
    setSelection(null);
  }, [updateTableProps]);

  const deleteColumnAt = useCallback(function deleteColumnAt(columnIndex: number) {
    updateTableProps(deleteTableColumn(latestPropsRef.current, columnIndex));
    setSelection(null);
  }, [updateTableProps]);

  const insertRowAt = useCallback(function insertRowAt(rowIndex: number) {
    updateTableProps(insertTableRow(latestPropsRef.current, rowIndex));
  }, [updateTableProps]);

  const insertColumnAt = useCallback(function insertColumnAt(columnIndex: number) {
    updateTableProps(insertTableColumn(latestPropsRef.current, columnIndex));
  }, [updateTableProps]);

  const pasteSelectionContents = useCallback(function pasteSelectionContents(currentSelection: TableSelection) {
    if (!clipboard) return;
    updateTableProps(pasteTableClipboard(latestPropsRef.current, currentSelection, clipboard));
  }, [clipboard, updateTableProps]);

  function runMenuAction(action: () => void) {
    action();
    setContextMenu(null);
  }

  const rowOverrides = parseRowOverrides(block.props);
  const colOverrides = parseColOverrides(block.props);

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-20 overflow-visible rounded-[inherit]"
        ref={frameRef}
        style={{ color: colors.text }}
        tabIndex={-1}
      >
        <div
          className="absolute grid overflow-hidden rounded-md border shadow-[0_8px_20px_rgba(15,23,42,0.12)]"
          style={{
            ...columnHeaderStyle,
            background: editorControlColors.background,
            borderColor: editorControlColors.border
          }}
        >
          {columnLabels.map((label, columnIndex) => {
            const isSelected = selection?.kind === "column" && selection.index === columnIndex;

            return (
              <button
                aria-label={`Select column ${columnIndex + 1}`}
                className="pointer-events-auto min-w-0 truncate px-1 text-center text-[12px] font-semibold outline-none transition-colors"
                data-table-context-target
                key={`table-column-hit-${columnIndex}`}
                onClick={(event) => {
                  event.stopPropagation();
                  selectTablePart({ index: columnIndex, kind: "column" });
                }}
                onContextMenu={(event) => openContextMenu(event, { index: columnIndex, kind: "column" })}
                onPointerDown={stopFramePointer}
                style={{
                  background: isSelected ? editorControlColors.selectedBackground : "transparent",
                  borderRight: columnIndex === columns - 1 ? 0 : `1px solid ${editorControlColors.border}`,
                  color: isSelected ? editorControlColors.selectedText : editorControlColors.text
                }}
                type="button"
              >
                {label}
              </button>
            );
          })}
        </div>

        <div
          className="absolute grid overflow-hidden rounded-md border shadow-[0_8px_20px_rgba(15,23,42,0.12)]"
          style={{
            ...rowHeaderStyle,
            background: editorControlColors.background,
            borderColor: editorControlColors.border
          }}
        >
          {rowLabels.map((label, rowIndex) => {
            const isSelected = selection?.kind === "row" && selection.index === rowIndex;

            return (
              <button
                aria-label={`Select row ${rowIndex + 1}`}
                className="pointer-events-auto min-w-0 truncate px-1 text-center text-[12px] font-semibold outline-none transition-colors"
                data-table-context-target
                key={`table-row-hit-${rowIndex}`}
                onClick={(event) => {
                  event.stopPropagation();
                  selectTablePart({ index: rowIndex, kind: "row" });
                }}
                onContextMenu={(event) => openContextMenu(event, { index: rowIndex, kind: "row" })}
                onPointerDown={stopFramePointer}
                style={{
                  background: isSelected ? editorControlColors.selectedBackground : "transparent",
                  borderBottom: rowIndex === rows - 1 ? 0 : `1px solid ${editorControlColors.border}`,
                  color: isSelected ? editorControlColors.selectedText : editorControlColors.text
                }}
                type="button"
              >
                {label}
              </button>
            );
          })}
        </div>

        <div
          className="absolute inset-0 grid overflow-hidden rounded-[inherit]"
          style={{
            ...tableGridStyle,
            background: colors.background,
            border: `${borderWidth}px solid ${colors.border}`,
            boxSizing: "border-box"
          }}
        >
          {cells.flatMap((row, rowIndex) =>
            row.map((cell, columnIndex) => {
              const rowSelected = selection?.kind === "row" && selection.index === rowIndex;
              const columnSelected = selection?.kind === "column" && selection.index === columnIndex;
              const selected = rowSelected || columnSelected;

              return (
                <EditableTableCell
                  baseStyle={baseCellStyle}
                  colOverride={colOverrides[columnIndex]}
                  colors={colors}
                  columnIndex={columnIndex}
                  key={`table-cell-editor-${rowIndex}-${columnIndex}`}
                  onContextMenu={(event) => openCellContextMenu(event, rowIndex, columnIndex)}
                  onPointerDown={stopFramePointer}
                  onSelect={() => {
                    onSelectBlock(blockIndex);
                    setSelection(null);
                    onSelectionChangeRef.current?.(null);
                  }}
                  onUpdate={(value, transient) => updateCell(rowIndex, columnIndex, value, transient)}
                  rowIndex={rowIndex}
                  rowOverride={rowOverrides[rowIndex]}
                  selected={selected}
                  value={cell}
                />
              );
            })
          )}
        </div>


        {selection ? (
          <TableSelectionResizeOverlay
            columnTracks={columnTracks}
            onResizeStart={startTableTrackResize}
            rowTracks={rowTracks}
            selection={selection}
          />
        ) : null}

        {/* ── Floating style bar for selected row/column ── */}
        {selection ? (
          <TableSelectionStyleBar
            block={block}
            columnTracks={columnTracks}
            headerHeight={headerHeight}
            onUpdateStyle={updateSelectionStyle}
            rowHeaderWidth={rowHeaderWidth}
            rowTracks={rowTracks}
            selection={selection}
          />
        ) : null}
      </div>

      {contextMenu ? (
        <TableContextMenu
          clipboard={clipboard}
          canUseColumnActions={contextMenu.target.columnIndex !== undefined}
          canUseRowActions={contextMenu.target.rowIndex !== undefined}
          menuRef={menuRef}
          onClear={() => runMenuAction(() => clearSelectionContents(contextMenu.selection))}
          onCopy={() => runMenuAction(() => copySelection(contextMenu.selection))}
          onCut={() => runMenuAction(() => cutSelectionContents(contextMenu.selection))}
          onDeleteColumn={() => runMenuAction(() => deleteColumnAt(contextMenu.target.columnIndex ?? contextMenu.selection.index))}
          onDeleteRow={() => runMenuAction(() => deleteRowAt(contextMenu.target.rowIndex ?? contextMenu.selection.index))}
          onInsertColumn={() => runMenuAction(() => insertColumnAt(contextMenu.target.columnIndex ?? contextMenu.selection.index))}
          onInsertRow={() => runMenuAction(() => insertRowAt(contextMenu.target.rowIndex ?? contextMenu.selection.index))}
          onPaste={() => {
            if (!clipboard) return;
            runMenuAction(() => pasteSelectionContents(contextMenu.selection));
          }}
          position={contextMenu.position}
          selection={contextMenu.selection}
        />
      ) : null}
    </>
  );
}

function EditableTableCell({
  baseStyle,
  colOverride,
  colors,
  columnIndex,
  onContextMenu,
  onPointerDown,
  onSelect,
  onUpdate,
  rowIndex,
  rowOverride,
  selected,
  value
}: {
  baseStyle: CSSProperties;
  colOverride?: CellStyleOverride;
  colors: ReturnType<typeof tableColors>;
  columnIndex: number;
  onContextMenu: (event: MouseEvent<HTMLTextAreaElement>) => void;
  onPointerDown: (event: PointerEvent<HTMLTextAreaElement>) => void;
  onSelect: () => void;
  onUpdate: (value: string, transient: boolean) => void;
  rowIndex: number;
  rowOverride?: CellStyleOverride;
  selected: boolean;
  value: string;
}) {
  const overrideBg = rowOverride?.background || colOverride?.background;
  const overrideText = rowOverride?.textColor || colOverride?.textColor;
  const overrideBorder = rowOverride?.borderColor || colOverride?.borderColor;

  const background = overrideBg || (selected ? colors.selectionSoft : rowIndex % 2 === 1 ? colors.stripeBackground : colors.cellBackground);
  const color = overrideText || colors.text;

  const borderStyle = overrideBorder
    ? { borderBottomColor: overrideBorder, borderRightColor: overrideBorder }
    : {};

  return (
    <textarea
      aria-label={`Edit cell ${rowIndex + 1}, ${columnIndex + 1}`}
      className="pointer-events-auto h-full w-full resize-none overflow-hidden bg-transparent outline-none"
      data-table-context-target
      onChange={(event) => onUpdate(event.currentTarget.value, true)}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={onContextMenu}
      onFocus={() => onSelect()}
      onKeyDown={(event) => event.stopPropagation()}
      onPointerDown={onPointerDown}
      onBlur={(event) => {
        const nextValue = event.currentTarget.value;

        if (nextValue !== value) {
          onUpdate(nextValue, false);
        }
      }}
      spellCheck={false}
      style={{
        ...baseStyle,
        ...borderStyle,
        background,
        color,
        display: "block",
        fontFamily: "inherit",
        height: "100%",
        outline: "none",
        resize: "none",
        width: "100%"
      }}
      value={value}
    />
  );
}

function tableCellStyle({
  borderColor,
  borderWidth,
  fontSize,
  textAlign,
  verticalAlign
}: {
  borderColor: string;
  borderWidth: number;
  fontSize: number;
  textAlign: "center" | "left" | "right";
  verticalAlign: "center" | "flex-end" | "flex-start";
}): CSSProperties {
  return {
    alignItems: verticalAlign,
    borderBottomColor: borderColor,
    borderBottomStyle: "solid",
    borderBottomWidth: `${borderWidth}px`,
    borderRightColor: borderColor,
    borderRightStyle: "solid",
    borderRightWidth: `${borderWidth}px`,
    boxSizing: "border-box",
    display: "flex",
    fontSize,
    justifyContent: justifyValue(textAlign),
    lineHeight: 1.25,
    minHeight: 0,
    minWidth: 0,
    padding: "8px 10px",
    textAlign
  };
}

const editorControlColors = {
  background: "rgba(255,255,255,0.96)",
  border: "rgba(148,163,184,0.28)",
  selectedBackground: "rgba(236,72,153,0.90)",
  selectedText: "#ffffff",
  text: "#374151"
} satisfies Record<string, string>;

function tableColors(props: Record<string, string | number>) {
  return {
    background: colorValue(props.background ?? props.backgroundColor ?? props.bg, "rgba(255,255,255,0.02)"),
    border: colorValue(props.borderColor, "#111827"),
    cellBackground: colorValue(props.cellBackground, "rgba(255,255,255,0)"),
    selection: "rgba(236,72,153,0.62)",
    selectionSoft: "rgba(236,72,153,0.18)",
    stripeBackground: colorValue(props.stripeBackground, "rgba(17,24,39,0.04)"),
    text: colorValue(props.color ?? props.textColor, "#111827")
  };
}

function colorValue(value: string | number | undefined, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function numberFromProp(value: string | number | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? Math.max(parsed, 0) : fallback;
}

function cleanTableEditorProps(props: Record<string, string | number>) {
  return clearTableEditorSelectionProps(props);
}

function tableMenuTargetFromSelection(selection: TableSelection): TableMenuTarget {
  return selection.kind === "row"
    ? { rowIndex: selection.index }
    : { columnIndex: selection.index };
}

function tableTextAlign(value: string | number | undefined) {
  if (value === "center" || value === "right") {
    return value;
  }

  return "left";
}

function tableVerticalAlign(value: string | number | undefined) {
  if (value === "bottom") {
    return "flex-end";
  }

  if (value === "middle" || value === "center") {
    return "center";
  }

  return "flex-start";
}

function justifyValue(value: "center" | "left" | "right") {
  if (value === "center") return "center";
  if (value === "right") return "flex-end";
  return "flex-start";
}

function canvasBoundaryRect(frame: HTMLElement | null) {
  return frame?.closest("[data-canvas-surface]")?.getBoundingClientRect()
    ?? frame?.closest("[aria-label^='16:9 canvas']")?.getBoundingClientRect()
    ?? document.querySelector("[data-canvas-surface]")?.getBoundingClientRect()
    ?? null;
}

function clampedTableMenuPosition(event: MouseEvent<HTMLElement>, boundaryRect?: DOMRect | null) {
  const menuWidth = 240;
  const menuHeight = 276;
  const margin = 12;
  const rect = boundaryRect ?? {
    bottom: window.innerHeight,
    left: 0,
    right: window.innerWidth,
    top: 0
  };
  const minX = rect.left + margin;
  const minY = rect.top + margin;
  const maxX = Math.max(minX, rect.right - menuWidth - margin);
  const maxY = Math.max(minY, rect.bottom - menuHeight - margin);

  return {
    x: Math.max(minX, Math.min(event.clientX, maxX)),
    y: Math.max(minY, Math.min(event.clientY, maxY))
  };
}

function TableSelectionResizeOverlay({
  columnTracks,
  onResizeStart,
  rowTracks,
  selection
}: {
  columnTracks: number[];
  onResizeStart: (selection: TableSelection, event: PointerEvent<HTMLButtonElement>) => void;
  rowTracks: number[];
  selection: TableSelection;
}) {
  const isColumn = selection.kind === "column";
  const tracks = isColumn ? columnTracks : rowTracks;
  const geometry = selectedTrackGeometry(tracks, selection.index);
  const canResize = tracks.length > 1;
  const overlayStyle: CSSProperties = {
    background: "rgba(236,72,153,0.12)",
    border: "2px solid rgba(236,72,153,0.92)",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.62), 0 10px 24px rgba(236,72,153,0.22)",
    pointerEvents: "none",
    position: "absolute",
    zIndex: 24,
    ...(isColumn
      ? {
          bottom: 0,
          left: `${geometry.offset}%`,
          top: 0,
          width: `${geometry.size}%`
        }
      : {
          height: `${geometry.size}%`,
          left: 0,
          right: 0,
          top: `${geometry.offset}%`
        })
  };
  const handleStyle: CSSProperties = {
    background: "#ec4899",
    border: "1px solid rgba(255,255,255,0.82)",
    boxShadow: "0 8px 22px rgba(236,72,153,0.45)",
    cursor: isColumn ? "col-resize" : "row-resize",
    pointerEvents: "auto",
    position: "absolute",
    ...(isColumn
      ? {
          borderRadius: 999,
          height: 46,
          right: -6,
          top: "50%",
          transform: "translateY(-50%)",
          width: 10
        }
      : {
          borderRadius: 999,
          bottom: -6,
          height: 10,
          left: "50%",
          transform: "translateX(-50%)",
          width: 46
        })
  };

  return (
    <div style={overlayStyle}>
      {canResize ? (
        <button
          aria-label={isColumn ? `Resize column ${selection.index + 1}` : `Resize row ${selection.index + 1}`}
          className="appearance-none p-0"
          onPointerDown={(event) => onResizeStart(selection, event)}
          style={handleStyle}
          title={isColumn ? "Drag to resize column" : "Drag to resize row"}
          type="button"
        />
      ) : null}
    </div>
  );
}

function selectedTrackGeometry(tracks: number[], index: number) {
  const total = trackTotal(tracks);
  const offset = tracks.slice(0, index).reduce((sum, value) => sum + Math.max(value, 0), 0);
  const size = Math.max(tracks[index] ?? 0, 0);

  return {
    offset: total <= 0 ? 0 : (offset / total) * 100,
    size: total <= 0 ? 100 : (size / total) * 100
  };
}

function trackTotal(tracks: number[]) {
  return tracks.reduce((sum, value) => sum + Math.max(value, 0), 0) || 1;
}

function resizeTrackPair(tracks: number[], index: number, neighborIndex: number, deltaUnits: number) {
  const minTrack = 0.28;
  const nextTracks = [...tracks];
  const current = Math.max(nextTracks[index] ?? 1, minTrack);
  const neighbor = Math.max(nextTracks[neighborIndex] ?? 1, minTrack);
  const minDelta = minTrack - current;
  const maxDelta = neighbor - minTrack;
  const clampedDelta = Math.min(Math.max(deltaUnits, minDelta), maxDelta);

  nextTracks[index] = current + clampedDelta;
  nextTracks[neighborIndex] = neighbor - clampedDelta;
  return nextTracks;
}

// ─── Floating Style Bar ──────────────────────────────────────────────────────

function TableSelectionStyleBar({
  block,
  columnTracks,
  headerHeight,
  onUpdateStyle,
  rowHeaderWidth,
  rowTracks,
  selection
}: {
  block: TableBlock;
  columnTracks: number[];
  headerHeight: number;
  onUpdateStyle: (selection: TableSelection, patch: CellStyleOverride) => void;
  rowHeaderWidth: number;
  rowTracks: number[];
  selection: TableSelection;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const isRow = selection.kind === "row";
  const index = selection.index;

  const rowOverrides = parseRowOverrides(block.props);
  const colOverrides = parseColOverrides(block.props);
  const currentOverride = isRow ? rowOverrides[index] : colOverrides[index];

  const bgColor = currentOverride?.background || "";
  const borderColor = currentOverride?.borderColor || "";
  const textColor = currentOverride?.textColor || "";

  function handleUpdate(patch: CellStyleOverride) {
    onUpdateStyle(selection, patch);
  }

  // Calculate position completely outside the headers
  const style: CSSProperties = {
    position: "absolute",
    zIndex: 30,
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "rgba(24, 24, 27, 0.95)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "8px",
    padding: "6px",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6)",
    transform: "translate(-50%, -50%)",
    pointerEvents: "auto"
  };

  if (isRow) {
    const geometry = selectedTrackGeometry(rowTracks, index);
    style.left = `calc(-${rowHeaderWidth + 38}px)`;
    style.top = `${geometry.offset + geometry.size / 2}%`;
  } else {
    const geometry = selectedTrackGeometry(columnTracks, index);
    style.left = `${geometry.offset + geometry.size / 2}%`;
    style.top = `calc(-${headerHeight + 38}px)`;
  }

  return (
    <>
      <div
        className="animate-[bubble-appear_0.15s_ease-out]"
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        style={style}
      >
        <button
          aria-label="Style Palette"
          className={`flex h-7 w-7 items-center justify-center rounded transition-colors outline-none focus-visible:ring-1 focus-visible:ring-white/50 ${isOpen ? "bg-white/20 text-white" : "text-neutral-400 hover:bg-white/10 hover:text-white"
            }`}
          onPointerDown={(event) => {
            event.stopPropagation();
            event.preventDefault();
            setIsOpen((value) => !value);
          }}
          ref={buttonRef}
          title="Style Palette"
          type="button"
        >
          <Palette size={14} />
        </button>
      </div>

      {isOpen && (
        <CombinedStylePicker
          anchorRef={buttonRef}
          bgColor={bgColor}
          borderColor={borderColor}
          onChangeBg={(v) => handleUpdate({ background: v })}
          onChangeBorder={(v) => handleUpdate({ borderColor: v })}
          onChangeText={(v) => handleUpdate({ textColor: v })}
          onClose={() => setIsOpen(false)}
          textColor={textColor}
          isRow={isRow}
        />
      )}
    </>
  );
}

// ─── Combined Style Picker Popup ─────────────────────────────────────────────

type ColorTab = "bg" | "border" | "text";

function stopFloatingPointer(event: PointerEvent<HTMLElement>) {
  event.stopPropagation();
}

function stopFloatingPointerAndPrevent(event: PointerEvent<HTMLElement>) {
  event.stopPropagation();
  event.preventDefault();
}

function useAnchoredPopover({
  anchorRef,
  panelRef,
  onClose,
  width = 240,
  offset = 8,
  isRow
}: {
  anchorRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  width?: number;
  offset?: number;
  isRow?: boolean;
}) {
  const [style, setStyle] = useState<CSSProperties>({});

  useEffect(() => {
    function updatePosition() {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;

      const margin = 12;
      const popupStyle: CSSProperties = {
        position: "fixed",
        zIndex: 10000,
        width
      };

      if (isRow) {
        // Pop to the left of the anchor
        popupStyle.top = Math.max(margin, rect.top);
        if (rect.left < width + margin) {
          popupStyle.left = rect.right + offset;
        } else {
          popupStyle.right = window.innerWidth - rect.left + offset;
        }
      } else {
        // Pop above the anchor
        const maxLeft = Math.max(window.innerWidth - width - margin, margin);
        popupStyle.left = Math.min(Math.max(rect.left - width / 2 + rect.width / 2, margin), maxLeft);
        
        if (rect.top < 260) { // Not enough space above, pop below
          popupStyle.top = rect.bottom + offset;
        } else {
          popupStyle.bottom = window.innerHeight - rect.top + offset;
        }
      }

      setStyle(popupStyle);
    }

    function handlePointerDown(event: globalThis.PointerEvent) {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      onClose();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [anchorRef, panelRef, onClose, width, offset, isRow]);

  return style;
}

function ColorPanel({
  value,
  onChange,
  onClose
}: {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}) {
  const { customSwatches } = useCustomSwatches();
  const presets = uniqueColors([...customSwatches, ...defaultColorPresets]);
  const pickerValue = hexColorValue(value) ?? "#ffffff";

  return (
    <>
      <div className="mb-2.5 flex items-center gap-2">
        <input
          aria-label="Color picker"
          className="h-7 flex-1 cursor-pointer rounded border border-neutral-800 bg-transparent p-0"
          onChange={(event) => onChange(event.target.value)}
          onPointerDown={(event) => event.stopPropagation()}
          type="color"
          value={pickerValue}
        />

        <input
          className="w-20 rounded border border-neutral-800 bg-black px-2 py-1 font-mono text-[11px] text-neutral-200 outline-none placeholder:text-neutral-600 focus:border-neutral-500"
          onChange={(event) => onChange(event.target.value)}
          onPointerDown={(event) => event.stopPropagation()}
          placeholder="inherit"
          type="text"
          value={value}
        />

        <button
          aria-label="Clear color"
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-neutral-800 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
          onPointerDown={(event) => {
            stopFloatingPointerAndPrevent(event);
            onChange("");
            onClose();
          }}
          title="Clear color"
          type="button"
        >
          <Minus size={12} />
        </button>
      </div>

      <div className="grid grid-cols-8 gap-1">
        <button
          aria-label="Transparent"
          className={`relative flex h-5 items-center justify-center overflow-hidden rounded border transition-transform hover:scale-110 ${value === "transparent" ? "border-white" : "border-neutral-700 bg-neutral-900"
            }`}
          onPointerDown={(event) => {
            stopFloatingPointerAndPrevent(event);
            onChange("transparent");
            onClose();
          }}
          type="button"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM0NCIvPjxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM0NCIvPjwvc3ZnPg==')] opacity-50" />
          <div className="absolute inset-0 m-auto h-[2px] w-[140%] -rotate-45 bg-red-500/80" />
        </button>

        {presets.map((preset) => (
          <button
            aria-label={`Use ${preset}`}
            className={`h-5 rounded border transition-transform hover:scale-110 ${value.toLowerCase() === preset.toLowerCase() ? "border-white" : "border-neutral-700"
              }`}
            key={preset}
            onPointerDown={(event) => {
              stopFloatingPointerAndPrevent(event);
              onChange(preset);
              onClose();
            }}
            style={{ background: preset }}
            type="button"
          />
        ))}
      </div>
    </>
  );
}

function CombinedStylePicker({
  anchorRef,
  bgColor,
  borderColor,
  textColor,
  onChangeBg,
  onChangeBorder,
  onChangeText,
  onClose,
  isRow
}: {
  anchorRef: RefObject<HTMLElement | null>;
  bgColor: string;
  borderColor: string;
  textColor: string;
  onChangeBg: (value: string) => void;
  onChangeBorder: (value: string) => void;
  onChangeText: (value: string) => void;
  onClose: () => void;
  isRow?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<ColorTab>("bg");
  const panelRef = useRef<HTMLDivElement | null>(null);
  const style = useAnchoredPopover({ anchorRef, panelRef, onClose, width: 240, isRow });

  const value = activeTab === "bg" ? bgColor : activeTab === "border" ? borderColor : textColor;
  const onChange = activeTab === "bg" ? onChangeBg : activeTab === "border" ? onChangeBorder : onChangeText;

  return createPortal(
    <div
      className="w-56 rounded-xl border border-neutral-700 bg-[#111111] p-3 shadow-2xl shadow-black/60 animate-[bubble-appear_0.15s_ease-out]"
      data-table-style-popover
      ref={panelRef}
      style={style}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={stopFloatingPointer}
      onPointerUp={stopFloatingPointer}
    >
      <div className="mb-3 flex rounded-md bg-white/[0.05] p-0.5">
        {(["bg", "border", "text"] as const).map((tab) => (
          <button
            key={tab}
            className={`flex flex-1 items-center justify-center rounded-sm py-1.5 transition-colors ${activeTab === tab ? "bg-white/10 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"
              }`}
            onPointerDown={(event) => {
              stopFloatingPointerAndPrevent(event);
              setActiveTab(tab);
            }}
            title={tab === "bg" ? "Background" : tab === "border" ? "Border" : "Text"}
            type="button"
          >
            {tab === "bg" ? <Paintbrush size={14} /> : tab === "border" ? <SquareSlash size={14} /> : <TypeIcon size={14} />}
          </button>
        ))}
      </div>

      <div className="pt-2">
        <ColorPanel onChange={onChange} onClose={onClose} value={value} />
      </div>
    </div>,
    document.body
  );
}
