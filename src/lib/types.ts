export type SingleFileDataType = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string | null;
  url: string | null;
  type: string | null;
  createdBy: string | null;
  folderId: string | null;
};

export type FolderFormType = {
  name: string;
  url: string;
  type: string;
  folderId: string;
};

export type ExplicitFilteredFoldersType =
  | {
      id: string;
      name: string | null;
      createdAt: Date;
      updatedAt: Date;
      modification: unknown[] | null;
      createdBy: string | null;
      parentId: string | null;
    }[]
  | undefined;

export type ExplicitFilteredFilesType =
  | {
      id: string;
      type: string | null;
      name: string | null;
      createdAt: Date;
      updatedAt: Date;
      createdBy: string | null;
      url: string | null;
      folderId: string | null;
    }[]
  | undefined;
