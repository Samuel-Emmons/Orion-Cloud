import type {Models} from "node-appwrite"
import Link from "next/link"
import Thumbnail from "@/components/Thumbnail"
import FormattedDateTime from "@/components/FormattedDateTime"
import { convertFileSize } from "@/lib/utils"
import ActionDropdown from "@/components/ActionDropdown"

export type CardFile = Models.Document & {
    url: string;
    type: string;
    extension: string;
    size: number;
    name: string;
    bucketFileId: string;
    owner?: string | { fullName?: string } | null;
};

export const Card = ({file}: {file: CardFile}) => {
    const ownerName = typeof file.owner === "object" ? file.owner?.fullName : undefined;

    return <article className="group relative flex h-full min-w-0 flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 text-gray-900 shadow-sm transition hover:border-brand hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
                <Thumbnail type={file.type} extension={file.extension} url={file.url} className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50" imageClassName="!size-9 rounded-lg"/>
                <div className="flex min-w-0 flex-col items-end gap-1">
                    <div className="relative z-10 text-xs text-gray-500">
                        <ActionDropdown file={file}/>
                    </div>
                    <span className="max-w-full truncate rounded-md bg-brand/10 px-2 py-1 text-xs font-semibold uppercase text-gray-700">{file.extension || file.type}</span>
                    <p className="text-xs text-gray-500">{convertFileSize(file.size)}</p>
                </div>
            </div>
            <div className="min-w-0 space-y-1 border-t border-gray-100 pt-3">
                <h2 className="truncate text-sm font-semibold" title={file.name}>
                    <Link href={file.url} target="_blank" rel="noopener noreferrer" className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-brand focus-visible:after:ring-offset-2">
                        {file.name}
                    </Link>
                </h2>
                <FormattedDateTime date={file.$createdAt} className="text-xs text-gray-500"/>
                {ownerName && <p className="truncate text-xs text-gray-600">By: {ownerName}</p>}
            </div>
        </article>
}

export default Card;
