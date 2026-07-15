export type OfficialTemplateMetadata = {
  description: string;
  id: string;
  name: string;
  sortOrder: number;
  thumbnailUrl?: string;
};

export type OfficialTemplate = OfficialTemplateMetadata & {
  source: string;
};
