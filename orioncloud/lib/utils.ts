export { cn } from "cn"

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
