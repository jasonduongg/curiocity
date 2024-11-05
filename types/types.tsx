// src/types/types.ts

// Resource type
export interface Resource {
  id: string;
  documentId: string;
  name: string;
  text: string;
  url: string;
  dateAdded: string;
}

export interface Document {
  id?: string;
  name: string;
  files: Array<string>;
  text: string;
  dateAdded: string;
}
