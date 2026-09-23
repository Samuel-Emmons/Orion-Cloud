'use server';

import type {UploadFileProps, RenameFileProps, UpdateFileUsersProps, DeleteFileProps, GetFilesProps} from "@/types";
import {createAdminClient} from "@/lib/appwrite"
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Query, Models, AppwriteException } from "node-appwrite";
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

const createQueries = (currentUser: Models.Document & { email: string }, types: string[]) => {
    const queries = [
        Query.or([
            Query.equal('owner', currentUser.$id),
            // Shared recipients are stored as normalized emails, not user IDs.
            Query.contains('users', [currentUser.email.trim().toLowerCase()])
        ])
    ];

    // This additional query is ANDed with the owner/shared-access condition above.
    if (types.length > 0) queries.push(Query.equal('type', types));

    //TODO: 
    return queries;
}

export const getFiles = async ({types = []}: GetFilesProps = {}) => {
    const {databases} =  await createAdminClient();

    try{
        const currentUser = await getCurrentUser();

        if(!currentUser) throw new Error("User not found")
            const queries = createQueries(currentUser, types);

        const files = await databases.listDocuments<Models.Document & {
            owner?: string | { $id: string } | null;
        }>(
            appwriteConfig.databaseId,
            appwriteConfig.filesTableId,
            queries,
        );

        // The saved owner is the original uploader's profile ID, even after sharing.
        // Look up each distinct owner once, after filtering files for this viewer.
        const getOwnerId = (owner: (typeof files.documents)[number]["owner"]) =>
            typeof owner === "string" ? owner : owner?.$id;
        const ownerIds = [...new Set(files.documents.map(file => getOwnerId(file.owner))
            .filter((id): id is string => Boolean(id)))];
        const ownerEmails = new Map(await Promise.all(ownerIds.map(async (ownerId) => {
            try {
                // Return only the email needed by Details, not the whole user profile.
                const owner = await databases.getDocument<Models.Document & { email: string }>(
                    appwriteConfig.databaseId,
                    appwriteConfig.usersTableId,
                    ownerId,
                    [Query.select(["email"])],
                );
                return [ownerId, owner.email] as const;
            } catch (error) {
                // Keep files visible if their original owner's profile was deleted.
                if (error instanceof AppwriteException && error.code === 404) {
                    return [ownerId, null] as const;
                }
                throw error;
            }
        })));

        return parseStringify({
            ...files,
            documents: files.documents.map(file => ({
                ...file,
                ownerEmail: ownerEmails.get(getOwnerId(file.owner) ?? "") ?? null,
            })),
        });
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

export const deleteFile = async({fileId, path}: DeleteFileProps) =>{
    const {databases, storage} = await createAdminClient();

    try{
        // Never trust a browser-supplied owner or storage ID for deletion.
        const user = await getCurrentUser();
        if (!user) throw new Error("Please sign in");
        const file = await databases.getDocument<Models.Document & {
            owner: string | { $id: string };
            bucketFileId: string;
        }>(appwriteConfig.databaseId, appwriteConfig.filesTableId, fileId);
        const ownerId = typeof file.owner === "string" ? file.owner : file.owner?.$id;
        if (ownerId !== user.$id) throw new Error("Only the owner can delete this file");
        if (!file.bucketFileId) throw new Error("File has no storage ID");

        // Delete storage first so a failed storage request leaves the document for retry.
        // If storage was already removed, continue cleaning up the document.
        try {
            await storage.deleteFile(appwriteConfig.bucketId, file.bucketFileId);
        } catch (error) {
            if (!(error instanceof AppwriteException && error.code === 404)) throw error;
        }
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.filesTableId,
            fileId,
        );

        revalidatePath(path);
        return parseStringify({status: 'success'})
    }
    catch(error)
    {
        handleError(error, "Failed to delete file");
    }
}
