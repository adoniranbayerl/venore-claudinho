export type ContentTypeRecord = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryRecord = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EntryStatus = "draft" | "published";

export type EntryRecord = {
  id: string;
  contentTypeId: string;
  categoryId: string | null;
  title: string;
  slug: string;
  status: EntryStatus;
  data: unknown;
  mediaId: string | null;
  authorId: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
