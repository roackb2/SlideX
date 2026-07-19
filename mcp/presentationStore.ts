export type McpPresentationSummary = {
  id: string;
  lastOpenedAt: string;
  sourceRevision: number;
  title: string;
  updatedAt: string;
};

export type McpPresentation = McpPresentationSummary & {
  source: string;
};

export type SavedMcpPresentation = Omit<McpPresentationSummary, "lastOpenedAt">;

export type SaveMcpPresentationInput = {
  expectedRevision: number;
  presentationId: string;
  source: string;
};

export interface McpPresentationStore {
  getPresentation(presentationId?: string): Promise<McpPresentation>;
  getPresentationSummary(presentationId?: string): Promise<McpPresentationSummary>;
  listPresentations(limit?: number): Promise<McpPresentationSummary[]>;
  savePresentation(input: SaveMcpPresentationInput): Promise<SavedMcpPresentation>;
}
