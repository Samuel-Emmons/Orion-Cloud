"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, getFileType, convertFileToUrl } from "@/lib/utils";
import Thumbnail from "@/components/Thumbnail";
import { MAX_FILE_SIZE } from "@/constants";
import { toast } from "@/components/ui/toast";
import { usePathname } from "next/navigation";
import { uploadFile } from "@/lib/actions/file.actions";

interface Props {
  ownerId: string;
  accountId: string;
  className?: string;
}

interface UploadPreview {
  id: string;
  file: File;
  url: string;
}

const FileUploader = ({ ownerId, accountId, className }: Props) => {
  const path = usePathname();
  const [uploads, setUploads] = useState<UploadPreview[]>([]);
  const previewUrls = useRef(new Set<string>());

  useEffect(() => {
    const urls = previewUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const previews: UploadPreview[] = [];
      for (const file of acceptedFiles) {
        if (file.size > MAX_FILE_SIZE) {
          toast.add({
            title: "File too large",
            description: `${file.name} exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`,
            type: "error",
          });
          continue;
        }
        const { type, extension } = getFileType(file.name);
        const url =
          type === "image" && extension !== "svg" ? convertFileToUrl(file) : "";
        if (url) previewUrls.current.add(url);
        previews.push({ id: crypto.randomUUID(), file, url });
      }
      setUploads((previous) => [...previous, ...previews]);

      const uploadPromises = previews.map(async ({ id, file, url }) => {
        try {
          const result = await uploadFile({ file, ownerId, accountId, path });
          if (!result) throw new Error("Upload returned no file.");
        } catch {
          toast.add({
            title: "Upload failed",
            description: `Could not upload ${file.name}. Please try again.`,
            type: "error",
          });
        } finally {
          setUploads((previous) =>
            previous.filter((upload) => upload.id !== id),
          );
          if (url) {
            URL.revokeObjectURL(url);
            previewUrls.current.delete(url);
          }
        }
      });
      await Promise.all(uploadPromises);
    },
    [ownerId, accountId, path],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <>
      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer rounded-lg",
          isDragActive && "ring-2 ring-brand ring-offset-2",
        )}
      >
        <input {...getInputProps()} />
        <Button
          type="button"
          className={cn(
            "uploader-button bg-brand text-gray-950 hover:bg-brand/90",
            className,
          )}
        >
          <Image src="/assets/icons/upload.svg" alt="" width={24} height={24} />
          Upload
        </Button>
      </div>

      {uploads.length > 0 &&
        createPortal(
          <section
            aria-label="Upload progress"
            className="fixed inset-x-4 bottom-4 z-[60] overflow-hidden rounded-2xl border border-gray-200 border-t-4 border-t-brand bg-gray-50 text-gray-900 shadow-2xl sm:left-auto sm:right-6 sm:bottom-6 sm:w-96"
          >
            <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/15">
                <Upload className="size-5 text-brand" aria-hidden="true" />
              </div>
              <div role="status" aria-live="polite" aria-atomic="true">
                <h2 className="text-sm font-semibold">
                  Uploading {uploads.length}{" "}
                  {uploads.length === 1 ? "file" : "files"}
                </h2>
                <p className="mt-0.5 text-xs text-gray-600">
                  Keep this page open until finished.
                </p>
              </div>
            </div>
            <ul className="max-h-[40dvh] overflow-y-auto overscroll-contain divide-y divide-gray-200 px-5">
              {uploads.map(({ id, file, url }) => {
                const { type, extension } = getFileType(file.name);
                return (
                  <li key={id} className="flex items-center gap-3 py-4">
                    <Thumbnail
                      type={type}
                      extension={extension}
                      url={url}
                      className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                      imageClassName="max-h-full max-w-full rounded"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-medium"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        {file.size < 1024 * 1024
                          ? `${Math.max(1, Math.round(file.size / 1024))} KB`
                          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}{" "}
                        &middot; Uploading
                      </p>
                    </div>
                    <Loader2
                      className="size-5 shrink-0 animate-spin text-brand motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  </li>
                );
              })}
            </ul>
          </section>,
          document.body,
        )}
    </>
  );
};

export default FileUploader;
