export type McpPresentation = {
  id: string;
  lastOpenedAt?: string;
  source: string;
  sourceRevision: number;
  title: string;
  updatedAt: string;
};

export type McpPresentationSummary = {
  id: string;
  lastOpenedAt: string;
  sourceRevision: number;
  title: string;
  updatedAt: string;
};

export type SaveMcpPresentationInput = {
  expectedRevision: number;
  presentationId: string;
  source: string;
};

export interface McpPresentationStore {
  getPresentation(presentationId?: string): Promise<McpPresentation>;
  listPresentations(limit?: number): Promise<McpPresentationSummary[]>;
  savePresentation(input: SaveMcpPresentationInput): Promise<McpPresentation>;
}
