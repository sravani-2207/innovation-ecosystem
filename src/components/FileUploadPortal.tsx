import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useConvex } from "convex/react";
import {
  CheckCircle2,
  Eye,
  FileUp,
  Loader2,
  Paperclip,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const MAX_BYTES = 5 * 1024 * 1024;

export interface AttachedFile {
  fileName?: string;
  fileType?: string;
  fileStorageId?: Id<"_storage">;
}

/**
 * Upload portal for idea attachments: drag & drop or click to browse, upload
 * straight to Convex file storage with progress, then view / replace / remove.
 * The stored file id survives reloads; a short-lived URL is fetched to view.
 */
export function FileUploadPortal({
  value,
  onChange,
}: {
  value: AttachedFile | null;
  onChange: (next: AttachedFile | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useMutation(api.files.generateUploadUrl);
  const removeStored = useMutation(api.files.deleteFile);
  const convex = useConvex();

  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [urlCache] = useState(() => new Map<Id<"_storage">, string>());

  const startUpload = async (file: File) => {
    if (file.size > MAX_BYTES) {
      toast.error("Attachments are limited to 5 MB.");
      return;
    }
    setProgress(0);
    try {
      // 1 — ask the backend for a short-lived upload URL.
      const postUrl = await upload({});
      // 2 — upload directly to storage with progress tracking.
      const stored = await new Promise<{ storageId: Id<"_storage"> }>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", postUrl);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error(`Upload failed (${xhr.status})`));
            }
          };
          xhr.onerror = () => reject(new Error("Upload failed — network error."));
          xhr.send(file);
        },
      );

      // 3 — surface the stored file to the parent idea form.
      onChange({
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileStorageId: stored.storageId,
      });
      urlCache.set(stored.storageId, URL.createObjectURL(file));
      setViewUrl(null);
      toast.success(`Uploaded “${file.name}”.`);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong while uploading. Please try again.",
      );
    } finally {
      setProgress(null);
    }
  };

  const handleRemove = async () => {
    const current = value;
    onChange(null);
    setViewUrl(null);
    if (current?.fileStorageId) {
      try {
        await removeStored({ storageId: current.fileStorageId });
      } catch {
        // The attachment is already detached on the idea; storage cleanup is
        // best-effort here.
      }
    }
  };

  const openFile = async () => {
    if (!value?.fileStorageId) return;
    const cached = urlCache.get(value.fileStorageId);
    if (cached) {
      window.open(cached, "_blank");
      return;
    }
    setViewLoading(true);
    try {
      // Ask Convex for a short-lived URL; freshly uploaded files already have
      // a local object URL cached above.
      const url = await convex.query(api.files.getFileUrl, {
        storageId: value.fileStorageId,
      });
      if (!url) throw new Error();
      urlCache.set(value.fileStorageId, url);
      window.open(url, "_blank");
    } catch {
      toast.error(
        "Preview is unavailable for this file. It stays attached to the idea.",
      );
    } finally {
      setViewLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
          <span className="flex min-w-0 items-center gap-2 text-sm">
            <Paperclip className="size-4 shrink-0 text-primary" />
            <span className="truncate font-medium">{value.fileName}</span>
            <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
              {value.fileType?.split("/")[1] ?? "file"}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {value.fileStorageId ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 text-muted-foreground"
                onClick={openFile}
                disabled={viewLoading}
              >
                {viewLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Eye className="size-3.5" />
                )}
                View
              </Button>
            ) : (
              <span className="flex items-center gap-1 px-2 text-xs text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-success" />
                attached
              </span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 px-0 text-muted-foreground"
              aria-label="Replace file"
              onClick={() => inputRef.current?.click()}
            >
              <RotateCcw className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 px-0 text-muted-foreground hover:text-destructive"
              aria-label="Remove file"
              onClick={handleRemove}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) startUpload(f);
          }}
          className={`flex w-full flex-col items-center gap-1.5 rounded-lg border border-dashed px-4 py-7 text-sm transition-colors ${
            dragging
              ? "border-primary/60 bg-accent/60 text-foreground"
              : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
          }`}
        >
          <FileUp className="size-5" />
          <span className="font-medium">
            Drop a file here, or click to browse
          </span>
          <span className="text-xs text-muted-foreground/80">
            Sketches, datasets, documents or images — up to 5 MB
          </span>
        </button>
      )}

      {progress !== null && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
          <Loader2 className="size-4 animate-spin text-primary" />
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
            {progress}%
          </span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.csv,.xlsx,.ppt,.pptx,.txt"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) startUpload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
