import { Query, type Models } from "node-appwrite";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { constructDownloadUrl } from "@/lib/utils";

type DownloadFile = Models.Document & { name: string; bucketFileId: string };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return new Response("Please sign in to download files.", { status: 401 });

    const { id } = await params;
    const { databases } = await createAdminClient();
    // Apply the same owner/shared-user access rules as the file list.
    const files = await databases.listDocuments<DownloadFile>(
      appwriteConfig.databaseId,
      appwriteConfig.filesTableId,
      [Query.equal("$id", id), Query.or([
        Query.equal("owner", user.$id),
        // Match the email-based sharing list saved by updateFileUsers.
        Query.contains("users", [user.email.trim().toLowerCase()]),
      ])],
    );
    const file = files.documents[0];
    if (!file) return new Response("File not found.", { status: 404 });

    const response = await fetch(constructDownloadUrl(file.bucketFileId), {
      headers: {
        "X-Appwrite-Project": appwriteConfig.projectId,
        "X-Appwrite-Key": appwriteConfig.secretKey,
      },
      cache: "no-store",
      redirect: "error",
    });
    if (!response.ok || !response.body) {
      return new Response("Unable to download this file.", { status: 502 });
    }

    const filename = encodeURIComponent(file.name).replace(/[!'()*]/g,
      (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
    return new Response(response.body, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Unable to download. Please sign in and try again.", { status: 500 });
  }
}
