'use server';

import type {UploadFileProps} from "@/types";
import {createAdminClient} from "@/lib/appwrite"
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Query, Models } from "node-appwrite";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { InputFile } from "node-appwrite/file";
import { revalidatePath } from "next/cache";
import { getFileType, parseStringify } from "@/lib/utils";

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

const createQueries = (currentUser: Models.Document) => {
    const queries = [
        Query.or([
            Query.equal('owner', currentUser.$id),
            Query.contains('users', currentUser.$id)
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
