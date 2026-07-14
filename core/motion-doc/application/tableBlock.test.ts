import assert from "node:assert/strict";
import test from "node:test";
import {
  deleteTableColumn,
  deleteTableRow,
  insertTableColumn,
  insertTableRow,
  resizeTableProps,
  tableCellsFromProps,
  tableSizeFromProps
} from "@/core/motion-doc/application/tableBlock";
import type { MotionDocProps } from "@/core/motion-doc/domain/motionDocTypes";

const props: MotionDocProps = { cells: "A|B;1|2", columns: 2, rows: 2 };

test("table resize keeps existing cells and normalizes dimensions", () => {
  const resized = resizeTableProps(props, 3, 3);
  assert.deepEqual(tableSizeFromProps(resized), { columns: 3, rows: 3 });
  assert.deepEqual(tableCellsFromProps(resized, 3, 3)[0], ["A", "B", ""]);
});

test("table row and column commands preserve valid minimums", () => {
  const expanded = insertTableColumn(insertTableRow(props, 0), 0);
  assert.deepEqual(tableSizeFromProps(expanded), { columns: 3, rows: 3 });
  const reduced = deleteTableColumn(deleteTableRow(expanded, 1), 1);
  assert.deepEqual(tableSizeFromProps(reduced), { columns: 2, rows: 2 });
});
