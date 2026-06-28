import { useEffect, useState } from "react";

export function useLayerSelection(activeBlockCount: number) {
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [selectedBlockIndices, setSelectedBlockIndices] = useState<number[]>([]);

  useEffect(() => {
    setSelectedBlockIndices((current) => current.filter((index) => index >= 0 && index < activeBlockCount));
    setSelectedBlockIndex((current) => {
      if (current === null || current < activeBlockCount) {
        return current;
      }

      return null;
    });
  }, [activeBlockCount]);

  function selectSingleBlock(index: number | null) {
    setSelectedBlockIndex(index);
    setSelectedBlockIndices(index === null ? [] : [index]);
  }

  function clearBlockSelection() {
    selectSingleBlock(null);
  }

  function selectBlock(index: number, options: { additive?: boolean; range?: boolean } = {}) {
    if (options.range && selectedBlockIndex !== null) {
      const start = Math.min(selectedBlockIndex, index);
      const end = Math.max(selectedBlockIndex, index);
      const range = Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
      setSelectedBlockIndices(range);
      setSelectedBlockIndex(index);
      return;
    }

    if (options.additive) {
      setSelectedBlockIndices((current) => {
        const nextSelection = current.includes(index)
          ? current.filter((item) => item !== index)
          : [...current, index].sort((a, b) => a - b);

        setSelectedBlockIndex(nextSelection.includes(index) ? index : nextSelection[nextSelection.length - 1] ?? null);
        return nextSelection;
      });
      return;
    }

    selectSingleBlock(index);
  }

  function selectBlocks(indices: number[], options: { additive?: boolean } = {}) {
    const uniqueIndices = indices
      .filter((index, offset, items) => items.indexOf(index) === offset)
      .sort((a, b) => a - b);

    if (options.additive) {
      setSelectedBlockIndices((current) => {
        const nextSelection = [...new Set([...current, ...uniqueIndices])].sort((a, b) => a - b);
        setSelectedBlockIndex(nextSelection[nextSelection.length - 1] ?? null);
        return nextSelection;
      });
      return;
    }

    setSelectedBlockIndices(uniqueIndices);
    setSelectedBlockIndex(uniqueIndices[uniqueIndices.length - 1] ?? null);
  }

  return {
    clearBlockSelection,
    selectBlock,
    selectBlocks,
    selectedBlockIndex,
    selectedBlockIndices,
    selectSingleBlock,
    setSelectedBlockIndex
  };
}
