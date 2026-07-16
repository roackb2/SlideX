export type McpPresentation = {
  id: string;
  source: string;
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
  getPresentation(presentationId: string): Promise<McpPresentation>;
  savePresentation(input: SaveMcpPresentationInput): Promise<McpPresentation>;
}
