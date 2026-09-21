'use server';

import type {UploadFileProps, RenameFileProps, UpdateFileUsersProps} from "@/types";
import {createAdminClient} from "@/lib/appwrite"
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Query, Models } from "node-appwrite";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { InputFile } from "node-appwrite/file";
import { revalidatePath } from "next/cache";
import { getFileType, parseStringify } from "@/lib/utils";
import { z } from "zod";

const handleError = (error: unknown, message: string): never => {
    console.error(message, error);
    throw error;
};

const constructFileUrl = (fileId: string): string => {
    const endpoint = appwriteConfig.endpointUrl.replace(/\/$/, "");
    return `${endpoint}/storage/buckets/${encodeURIComponent(appwriteConfig.bucketId)}/files/${encodeURIComponent(fileId)}/view?project=${encodeURIComponent(appwriteConfig.projectId)}`;
};

export const uploadFile = async ({file, ownerId, accountId, path}: UploadFileProps) => {
    const {storage, databases} = await createAdminClient();

    try {
        const inputFile=InputFile.fromBuffer(file, file.name);

        const bucketFile = await storage.createFile(appwriteConfig.bucketId, ID.unique(), inputFile)

        const fileDocument = {
            type: getFileType(bucketFile.name).type,
            name: bucketFile.name,
            url: constructFileUrl(bucketFile.$id),
            extension: getFileType(bucketFile.name).extension,
            size: bucketFile.sizeOriginal,
            owner: ownerId,
            accountId,
            users: [],
            bucketFileId: bucketFile.$id,
        };

        const newFile = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.filesTableId,
            ID.unique(),
            fileDocument,
        )

     
        .catch(async(error: unknown) => {
                await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
                handleError(error, "Failed to create file document")
            });

            revalidatePath(path);
            return parseStringify(newFile);
    }catch(error){
        handleError(error, "Failed to upload file");
    }
}

const createQueries = (currentUser: Models.Document & { email: string }) => {
    const queries = [
        Query.or([
            Query.equal('owner', currentUser.$id),
            // Shared recipients are stored as normalized emails, not user IDs.
            Query.contains('users', [currentUser.email.trim().toLowerCase()])
        ])
    ];

    //TODO: 
    return queries;
}

export const getFiles = async () => {
    const {databases} =  await createAdminClient();

    try{
        const currentUser = await getCurrentUser();

        if(!currentUser) throw new Error("User not found")
            const queries = createQueries(currentUser);

        const files = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.filesTableId,
            queries,
        );

        return parseStringify(files);
    }catch(error)
    {
        handleError(error, "Failed to get files");
    }
}

export const renameFile = async({fileId, name, extension, path}: RenameFileProps) => {
    const {databases} = await createAdminClient();

    try
    {
        const trimmedName = name.trim();
        if (!trimmedName) throw new Error("File name cannot be empty");
        const suffix = extension ? `.${extension}` : "";
        const newName = suffix && !trimmedName.toLowerCase().endsWith(suffix.toLowerCase())
            ? `${trimmedName}${suffix}`
            : trimmedName;
        const updatedFile = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.filesTableId,
            fileId,{
                name: newName,
            }
        );
        revalidatePath(path);
        return parseStringify(updatedFile);
    } 
    catch(error)
    {handleError(error, "Failed to rename file")}
}

export const updateFileUsers = async({fileId, emails, path}: UpdateFileUsersProps) => {
    const {databases} = await createAdminClient();

    try
    {
        // Authenticate on the server and check ownership before using the admin client.
        // A recipient may read a shared file but cannot change its recipient list.
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("Please sign in");
        const file = await databases.getDocument<Models.Document & {
            owner: string | { $id: string };
        }>(appwriteConfig.databaseId, appwriteConfig.filesTableId, fileId);
        const ownerId = typeof file.owner === "string" ? file.owner : file.owner.$id;
        if (ownerId !== currentUser.$id) throw new Error("Only the owner can change sharing");

        // Validate every address; an empty array intentionally removes all recipients.
        const recipients = [...new Set(z.array(z.string().trim().toLowerCase().email()).parse(emails))];
        // Replace the full list, allowing both additions and removals in one save.
        const updatedFile = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.filesTableId,
            fileId,
            {
                users: recipients,
            },
        );

        revalidatePath(path);
        return parseStringify(updatedFile);
    } 
    catch(error)
    {handleError(error, "Failed to update file users")}
}
