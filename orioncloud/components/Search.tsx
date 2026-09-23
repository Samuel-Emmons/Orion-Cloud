"use client";
import Image from 'next/image'
import {Input} from "@/components/ui/input";
import {useEffect, useRef, useState} from "react";
import Thumbnail from "@/components/Thumbnail";
import { convertFileSize } from "@/lib/utils";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getFiles } from "@/lib/actions/file.actions";
import type { CardFile } from "@/components/Card";

const Search=()=>{
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("query") || "";
    const [query, setQuery] = useState(searchQuery);
    const [results, setResults] = useState<CardFile[]>([])
    const [open, setOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const dismissed = useRef(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleSelectFile = (file: CardFile) => {
        const pages: Record<string, string> = {
            document: "documents", image: "images",
            audio: "media", video: "media", other: "others",
        };
        const page = pages[file.type];
        if (!page) return;
        const params = new URLSearchParams({ query: file.name, fileId: file.$id });
        dismissed.current = true;
        setOpen(false);
        setQuery(file.name);
        router.push(`/${page}?${params.toString()}`);
    };

    useEffect(() => {
        const dismiss = (event: PointerEvent) => {
            if (!searchRef.current?.contains(event.target as Node)) {
                dismissed.current = true;
                setOpen(false);
            }
        };
        document.addEventListener("pointerdown", dismiss);
        return () => document.removeEventListener("pointerdown", dismiss);
    }, []);

    useEffect(()=>{
        // Ignore responses from an earlier query after the user types again.
        let active = true;
        if (!query.trim()) {
            setResults([]);
            setOpen(false);
            return;
        }
        const fetchFiles = async() => {
            try {
                const files = await getFiles({searchText: query.trim()});
                if (!active) return;
                setResults(files.documents);
                setOpen(!dismissed.current);
            } catch (error) {
                if (!active) return;
                console.error("Search failed", error);
                setResults([]);
                setOpen(false);
            }
        }

        // Wait until typing pauses instead of requesting on every keystroke.
        const timer = setTimeout(fetchFiles, 300);
        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [query]);

    useEffect(()=> {
        setQuery(searchQuery);
    }, [searchQuery]);

return(<div ref={searchRef} className="relative z-30 w-full min-w-0 max-w-xl flex-1" onKeyDown={event => {
    if (event.key === "Escape") {
        dismissed.current = true;
        setOpen(false);
    }
}} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
        dismissed.current = true;
        setOpen(false);
    }
}}>
    <div className="relative">
        <Image src="/assets/icons/search.svg" alt="" width={20} height={20} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2" />
        <Input type="search" aria-label="Search files" value={query} placeholder="Search files..." className="h-11 rounded-xl border-gray-200 bg-gray-50 pl-12 pr-4 text-gray-900 shadow-sm placeholder:text-gray-500 focus-visible:border-brand focus-visible:ring-brand/20" onFocus={() => {
            dismissed.current = false;
            if (query.trim() && results.length) setOpen(true);
        }} onChange={(e) => {
            dismissed.current = false;
            setOpen(false);
            setQuery(e.target.value);
            if (!e.target.value.trim()) {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("query");
                params.delete("fileId");
                const remaining = params.toString();
                router.replace(remaining ? `${pathname}?${remaining}` : pathname, { scroll: false });
            }
        }} />

        {open && (
            <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <p className="border-b border-gray-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Search results</p>
            <ul aria-label="Matching files" className="max-h-[min(24rem,50dvh)] overflow-y-auto overscroll-contain p-2">
                {results.length > 0
                    ? results.map(file => <li key={file.$id}>
                        <button type="button" onClick={() => handleSelectFile(file)} className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-brand/10 focus-visible:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                            <Thumbnail type={file.type} extension={file.extension} url={file.url} className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900" title={file.name}>{file.name}</p>
                                <p className="mt-1 text-xs text-gray-500">{file.extension.toUpperCase() || file.type} · {convertFileSize(file.size)}</p>
                            </div>
                        </button>
                    </li>)
                    : <li className="px-4 py-6 text-center text-sm text-gray-500">No matching files</li>}
            </ul>
            </div>
        )}
    </div>
</div>)

}

export default Search;
