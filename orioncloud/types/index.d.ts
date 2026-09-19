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
