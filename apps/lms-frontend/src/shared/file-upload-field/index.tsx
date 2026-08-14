"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { toastError } from "@/shared/toast/toast-error";
import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { cn } from "@/lib/utils";
import { IFile } from "@/components/leave/leave.types";
import UploadQueue from "./upload-queue";
import UploadedQueue from "./uploaded-queue";

interface FileUploadFieldProps {
  value: IFile[];
  onChange: (files: IFile[]) => void;
  uploadAction: (
    formData: FormData,
    onProgress?: (percent: number) => void,
  ) => Promise<string>;
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  disabled?: boolean;
  className?: string;
  invalid?: boolean;
  simulateProgress?: boolean;
}

function startZenoProgress(
  onTick: (percent: number) => void,
  ceiling = 90,
  intervalMs = 200,
) {
  let current = 0;
  const id = setInterval(() => {
    current += (ceiling - current) * 0.15;
    onTick(Math.round(current));
  }, intervalMs);
  return () => clearInterval(id);
}

export const FileUploadField = React.forwardRef<
  HTMLDivElement,
  FileUploadFieldProps
>(function FileUploadField(
  {
    value,
    onChange,
    uploadAction,
    maxFiles = 2,
    maxSize = 5 * 1024 * 1024,
    accept,
    disabled,
    className,
    invalid,
    simulateProgress = true,
  },
  ref,
) {
  const [localFiles, setLocalFiles] = React.useState<File[]>([]);

  const valueRef = React.useRef(value);
  valueRef.current = value;
  const localFilesRef = React.useRef(localFiles);
  localFilesRef.current = localFiles;

  const onFileReject = React.useCallback(
    (file: File, message: string) => {
      const finalMessage = message.startsWith("Maximum")
        ? `Maximum ${maxFiles} files allowed`
        : message;
      toastError(
        finalMessage,
        `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
      );
    },
    [maxFiles],
  );

  const onUpload = React.useCallback(
    async (
      files: File[],
      opts: {
        onProgress: (file: File, progress: number) => void;
        onSuccess: (file: File) => void;
        onError: (file: File, error: Error) => void;
      },
    ) => {
      await Promise.all(
        files.map(async (file) => {
          let receivedRealProgress = false;
          const stopZeno = simulateProgress
            ? startZenoProgress((percent) => {
                if (!receivedRealProgress) opts.onProgress(file, percent);
              })
            : () => {};

          try {
            const formData = new FormData();
            formData.append("file", file);

            const url = await uploadAction(formData, (percent) => {
              receivedRealProgress = true;
              stopZeno();
              opts.onProgress(file, percent);
            });

            stopZeno();

            if (!localFilesRef.current.includes(file)) return;

            opts.onProgress(file, 100);
            opts.onSuccess(file);

            const uploaded: IFile = {
              file_name: file.name,
              file_url: url,
              meta_data: {
                type: file.type,
                size: file.size,
              },
            };

            const next = [...valueRef.current, uploaded];
            valueRef.current = next;
            onChange(next);
            setLocalFiles((prev) => prev.filter((f) => f !== file));
          } catch (err) {
            stopZeno();
            const error =
              err instanceof Error ? err : new Error("Upload failed");
            opts.onError(file, error);
          }
        }),
      );
    },
    [uploadAction, onChange, simulateProgress],
  );

  const removeExisting = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const remainingSlots = Math.max(0, maxFiles - value.length);

  return (
    <div ref={ref} className={cn("flex flex-col gap-3", className)}>
      <FileUpload
        maxFiles={remainingSlots}
        maxSize={maxSize}
        accept={accept}
        invalid={invalid}
        disabled={disabled}
        value={localFiles}
        onValueChange={setLocalFiles}
        onUpload={onUpload}
        onFileReject={onFileReject}
        multiple
      >
  { !disabled &&  
      <FileUploadDropzone>
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center justify-center rounded-full border p-2.5">
              <Upload className="size-6 text-muted-foreground" />
            </div>

            <p className="font-medium text-sm">
              Drag & Drop or Choose file to upload
            </p>
            <p className="text-muted-foreground text-xs">
              Max {maxFiles} files · Up to {Math.round(maxSize / (1024 * 1024))}
              MB
            </p>
          </div>
          <FileUploadTrigger asChild>
            <Button variant="outline" size="sm" className="mt-2 w-fit">
              Browse files
            </Button>
          </FileUploadTrigger>
        </FileUploadDropzone>
  }

        <UploadQueue />
        {value.length > 0 && (
          <UploadedQueue
            value={value}
            disabled={disabled}
            removeExisting={removeExisting}
          />
        )}
      </FileUpload>
    </div>
  );
});
