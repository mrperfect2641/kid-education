import { useCallback, useEffect, useMemo, useState } from "react";
import { type FileError, type FileRejection, useDropzone } from "react-dropzone";

interface FileWithPreview extends File {
  preview?: string;
  errors: readonly FileError[];
}

type UseFileUploadOptions = {
  bucketName: string;
  path?: string;
  allowedMimeTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  cacheControl?: number;
  upsert?: boolean;
  uploadFile: (file: File, path?: string) => Promise<void>;
};

type UseFileUploadReturn = ReturnType<typeof useFileUpload>;

const useFileUpload = (options: UseFileUploadOptions) => {
  const { path, allowedMimeTypes = [], maxFileSize = Number.POSITIVE_INFINITY, maxFiles = 1, uploadFile } = options;
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ name: string; message: string }[]>([]);
  const [successes, setSuccesses] = useState<string[]>([]);
  const isSuccess = useMemo(() => errors.length === 0 && successes.length > 0 && successes.length === files.length, [errors.length, successes.length, files.length]);
  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    const validFiles = acceptedFiles.filter((file) => !files.find((x) => x.name === file.name)).map((file) => {
      (file as FileWithPreview).preview = URL.createObjectURL(file);
      (file as FileWithPreview).errors = [];
      return file as FileWithPreview;
    });
    const invalidFiles = fileRejections.map(({ file, errors }) => {
      (file as FileWithPreview).preview = URL.createObjectURL(file);
      (file as FileWithPreview).errors = errors;
      return file as FileWithPreview;
    });
    setFiles([...files, ...validFiles, ...invalidFiles]);
  }, [files]);
  const dropzoneProps = useDropzone({
    onDrop,
    noClick: true,
    accept: allowedMimeTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    maxFiles,
    multiple: maxFiles !== 1,
  });
  const onUpload = useCallback(async () => {
    setLoading(true);
    const responses = await Promise.all(files.map(async (file) => {
      try {
        await uploadFile(file, !!path ? `${path}/${file.name}` : file.name);
        return { name: file.name, message: undefined };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Upload failed";
        return { name: file.name, message };
      }
    }));
    setErrors(responses.filter((x) => x.message !== undefined) as { name: string; message: string }[]);
    setSuccesses(Array.from(new Set([...successes, ...responses.filter((x) => x.message === undefined).map((x) => x.name)])));
    setLoading(false);
  }, [files, path, successes, uploadFile]);
  useEffect(() => {
    if (files.length === 0) setErrors([]);
  }, [files.length]);
  return { files, setFiles, successes, isSuccess, loading, errors, setErrors, onUpload, maxFileSize, maxFiles, allowedMimeTypes, ...dropzoneProps };
};

export { useFileUpload, type UseFileUploadOptions, type UseFileUploadReturn };
