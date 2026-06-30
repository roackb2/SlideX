export type BlockUpdateOptions = {
  transient?: boolean;
};

export type BlockUpdater = (
  blockIndex: number,
  newProps: Record<string, string | number>,
  newText?: string,
  options?: BlockUpdateOptions
) => void;
