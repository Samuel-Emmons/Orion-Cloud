import type { CardFile } from "@/components/Card";
import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import { convertFileSize, formatDateTime } from "@/lib/utils";

const ImageThumbnail = ({file}: {file: CardFile}) => {
    return (
        <div className="flex justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
            <Thumbnail
                type={file.type}
                extension={file.extension}
                url={file.url}
                className="flex w-full items-center justify-center"
                imageClassName="!size-48 max-w-full rounded-lg object-contain"
            />
            <div className="flex flex-col">
                <p className="subtitle-2 mb-1">{file.name}</p>
                <FormattedDateTime date={file.$createdAt} className="caption"/>
            </div>
        </div>
    );
}

const DetailRow = ({label, value}:{label: string; value: string}) => {
    return <div className="flex gap-2">
        <p className="file-details-label">{label}</p>
        <p className="file-details-value">{value}</p>
    </div>
}

export const FileDetails = ({file}: {file: CardFile}) => {
    const ownerName = typeof file.owner === "object" && file.owner !== null
        ? file.owner.fullName ?? "Unknown owner"
        : "Unknown owner";
    return (<>
        <ImageThumbnail file={file}/>
        <DetailRow label="Format:" value={file.extension}/>
        <DetailRow label="Size:" value={convertFileSize(file.size)}/>
        <DetailRow label="Owner:" value={ownerName}/>
        <DetailRow label="Last edit:" value={formatDateTime(file.$updatedAt)}/>
    </>);
}
