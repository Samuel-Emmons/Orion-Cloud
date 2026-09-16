"use client"

import React from 'react'
import {useCallback, useState} from "react";
import {useDropzone} from "react-dropzone";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getFileType } from "@/lib/utils";

interface Props{
    ownerId: string;
    accountId: string;
    className?: string;
}

const FileUploader=({ ownerId, accountId, className}: Props)=>{
    const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback( async (acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
  }, []);
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

  return (
    <div {...getRootProps()} className="cursor-pointer">
      <input {...getInputProps()} />
      <Button type="button" className={cn('uploader-button bg-brand text-gray-950 hover:bg-brand/90', className)}>
        <Image src="/assets/icons/upload.svg" alt="upload" width={24} height={24}/>
        Upload
      </Button>
        {files.length > 0 &&(
            <ul className="uploader-preview-list">
                <h4 className="h4 text-light-100">Uploading</h4>

                {files.map((file, index) => {
                    const { type, extension} = getFileType(file.name);

                    return (
                        <li key={'${file.name}-${index}'} className="uploader-preview-item">
                            <div className="flex items-center gap-3">
                                Thumbnail
                            </div>
                        </li>
                    )
                })}
            </ul>
        )}

      {isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
    </div>
  );
}

export default FileUploader
