import { appwriteConfig } from "@/lib/appwrite/config";

export { cn } from "cn"

export const constructDownloadUrl = (fileId: string): string => {
    const endpoint = appwriteConfig.endpointUrl.replace(/\/+$/, "");
    const url = new URL(`${endpoint}/storage/buckets/${encodeURIComponent(appwriteConfig.bucketId)}/files/${encodeURIComponent(fileId)}/download`);
    url.searchParams.set("project", appwriteConfig.projectId);
    return url.toString();
};

export const formatDateTime = (date: string): string => {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "Invalid date";

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
    }).format(parsedDate);
};

export const convertFileSize = (bytes: number): string => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(Math.max(0, Math.floor(Math.log(bytes) / Math.log(1024))), units.length - 1);
    return `${Number((bytes / 1024 ** index).toFixed(2))} ${units[index]}`;
};

export const parseStringify = (value: unknown) => {
    return JSON.parse(JSON.stringify(value));
}

type FileType = "document" | "image" | "video" | "audio" | "other";

const fileExtensions: Record<Exclude<FileType, "other">, readonly string[]> = {
    document: ["pdf", "doc", "docx", "txt", "rtf", "odt", "md", "csv", "xls", "xlsx", "ods", "ppt", "pptx", "odp"],
    image: ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "tif", "tiff", "avif", "heic", "heif"],
    video: ["mp4", "webm", "mov", "avi", "mkv", "wmv", "flv", "m4v", "mpeg", "mpg", "3gp"],
    audio: ["mp3", "wav", "ogg", "oga", "flac", "aac", "m4a", "wma", "aiff", "aif", "opus"],
};

// Classifies the filename only; it does not validate the file's contents.
export const getFileType = (fileName: string): { type: FileType; extension: string } => {
    const name = fileName.trim().split(/[\\/]/).pop() ?? "";
    const dotIndex = name.lastIndexOf(".");
    // Extensionless files and dotfiles such as .gitignore have no extension.
    const extension = dotIndex > 0 ? name.slice(dotIndex + 1).toLowerCase() : "";

    for (const type of Object.keys(fileExtensions) as Array<keyof typeof fileExtensions>) {
        if (fileExtensions[type].includes(extension)) return { type, extension };
    }

    return { type: "other", extension };
};

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export const getFileIcon = (extension: string, type: string): string => {
    const category = type || getFileType(`file.${extension.replace(/^\./, "")}`).type;
    switch (category) {
        case "image": return "/assets/icons/images.svg";
        case "document": return "/assets/icons/documents.svg";
        case "audio":
        case "video": return "/assets/icons/media.svg";
        default: return "/assets/icons/others.svg";
    }
};
