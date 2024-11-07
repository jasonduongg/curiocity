// src/types/types.ts

// Resource type
export interface Resource {
  id: string;
  markdown: string;
  url: string;
}

export interface Document {
  id?: string;
  name: string;
  files: Array<string>;
  text: string;
  dateAdded: string;
}

export interface ResourceMeta {
  id: string;
  hash: string;
  name: string;
  dateAdded: string;
  lastOpened: string;
  notes: string;
  summary: string;
  tags: Array<string>;
}
