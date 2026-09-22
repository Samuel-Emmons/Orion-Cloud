import type { CardFile } from "@/components/Card";
import type { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import { convertFileSize, formatDateTime } from "@/lib/utils";

interface Props {
    file: CardFile;
    onInputChange: Dispatch<SetStateAction<string[]>>;
    onRemove: (email: string) => void;
}

export const ShareInput = ({file, onInputChange, onRemove}: Props) => {
    const users = file.users ?? [];
    return (
    <>
        <ImageThumbnail file={file}/>

        <div className="share-wrapper">
            <p className="subtitle-2 pl-1 text-light-100">
                Share file with other users
            </p>
                <Input
                type="email"
                multiple
                placeholder="Enter email address"
                onChange={e => onInputChange(e.target.value.split(',').map(email => email.trim()).filter(Boolean))}
                className="share-input-field"
                />
            <div className="pt-4">
                <div className="flex justify-between">
                    <p className="subtitle-2 text-light-100">Shared with</p>
                    <p className="subtitle-2 text-light-200">{users.length} users</p>
                </div>
                <ul className="pt-2">
                    {users.map((email) => (
                        <li key={email} className="flex items-center justify-between gap-2">
                            <p className="subtitle-2">{email}</p>
                            <Button type="button" aria-label={`Remove ${email}`} onClick={() => onRemove(email)}>
                                <Image src="/assets/icons/remove.svg" alt="" width={24} height={24} className="remove-icon"/>
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </>)
};

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
    return (<>
        <ImageThumbnail file={file}/>
        <DetailRow label="Format:" value={file.extension}/>
        <DetailRow label="Size:" value={convertFileSize(file.size)}/>
        <DetailRow label="Owner:" value={file.ownerEmail || "Owner email unavailable"}/>
        <DetailRow label="Last edit:" value={formatDateTime(file.$updatedAt)}/>
    </>);
}
