import type { FileType } from "@/lib/utils";

export interface GetFilesProps {
    types?: FileType[];
}

export interface UploadFileProps {
    file: File;
    ownerId: string;
    accountId: string;
    path: string;
}

export interface RenameFileProps {
    fileId: string;
    name: string;
    extension: string;
    path: string;
}

export interface UpdateFileUsersProps {
    fileId: string;
    emails: string[];
    path: string;
}

export interface DeleteFileProps {
    fileId: string;
    bucketFileId: string;
    path: string;
}
