"use client"

import React from 'react'
import {useCallback, useState} from "react";
import {useDropzone} from "react-dropzone";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getFileType } from "@/lib/utils";
import Thumbnail from "@/components/Thumbnail"
import {convertFileToUrl} from "@/lib/utils"
import { MAX_FILE_SIZE } from "@/constants";
import { toast } from "@/components/ui/toast"
import {usePathname} from "next/navigation"
import { uploadFile } from "@/lib/actions/file.actions";

interface Props{
    ownerId: string;
    accountId: string;
    className?: string;
}

const FileUploader=({ ownerId, accountId, className}: Props)=>{
  const path = usePathname();

  const [files, setFiles] = useState<File[]>([]);

  const handleRemoveFile = (e: React.MouseEvent<HTMLImageElement, MouseEvent>, fileName: string) => {
    e.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  const onDrop = useCallback( async (acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
    
    const uploadPromises = acceptedFiles.map(async(file) => {
      //clear files that don't match max file size criteria 
      if(file.size > MAX_FILE_SIZE){
        setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));

        toast.add({
          title: "File too large",
          description: `${file.name} exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`,
          type: "error",
        });
        return;
      }
      return uploadFile({file, ownerId, accountId, path}).then((uploadedFile)=>{
        if(uploadedFile)  {
          setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name))
        }
      }).catch(() => {
        setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
        toast.add({
          title: "Upload failed",
          description: `Could not upload ${file.name}. Please try again.`,
          type: "error",
        });
      })
    })
    await Promise.all(uploadPromises);
  }, 
  [ownerId, accountId, path]);
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
                        <li key={`${file.name}-${index}`} className="uploader-preview-item">
                            <div className="flex items-center gap-3">
                                <Thumbnail
                                 type = {type}
                                 extension={extension}
                                 url={convertFileToUrl(file)}
                                  />

                                  <div className="preview-item-name">
                                    {file.name}
                                    <Image src="/assets/icons/file-loader.gif" width={80} height={26} alt="loader"/>
                                  </div>
                            </div>

                            <Image src="/assets/icons/remove.svg" width={24} height={24} alt="Remove" onClick={(e) => handleRemoveFile(e, file.name)}/>
                        </li>
                    )
                })}
            </ul>
        )}
    </div>
  );
}

export default FileUploader
