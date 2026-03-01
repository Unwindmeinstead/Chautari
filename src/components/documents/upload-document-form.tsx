"use client";

import * as React from "react";
import { Upload, X, FileText, Image, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadDocument, DOC_TYPE_LABELS } from "@/lib/document-actions";
import type { DocumentRecord } from "@/lib/document-actions";

interface UploadDocumentFormProps {
  requestId: string;
  uploaderRole: "patient" | "agency_staff";
  onUploaded?: (doc: DocumentRecord) => void;
  onCancel?: () => void;
}

const DOC_TYPES = Object.entries(DOC_TYPE_LABELS);
const ACCEPTED = ".pdf,.jpg,.jpeg,.png,.webp,.heic";
const MAX_MB = 10;

export function UploadDocumentForm({
  requestId,
  uploaderRole,
  onUploaded,
  onCancel,
}: UploadDocumentFormProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [docType, setDocType] = React.useState("other");
  const [displayName, setDisplayName] = React.useState("");
  const [requiresSignature, setRequiresSignature] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Max ${MAX_MB}MB.`);
      return;
    }
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowed.includes(f.type)) {
      setError("Unsupported file type. Use PDF, JPG, PNG, or WebP.");
      return;
    }
    setFile(f);
    setError(null);
    // Auto-fill display name from filename
    if (!displayName) {
      const name = f.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");
      setDisplayName(name.slice(0, 60));
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Please select a file"); return; }

    setUploading(true);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("request_id", requestId);
    fd.append("doc_type", docType);
    fd.append("display_name", displayName || DOC_TYPE_LABELS[docType]);
    fd.append("requires_signature", String(requiresSignature));

    const result = await uploadDocument(fd);
    setUploading(false);

    if (result.error) { setError(result.error); return; }

    setSuccess(true);
    setTimeout(() => {
      if (result.document) onUploaded?.(result.document);
      setSuccess(false);
      setFile(null);
      setDisplayName("");
      setRequiresSignature(false);
    }, 1200);
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center space-y-2">
        <CheckCircle2 className="size-8 text-green-500 mx-auto" />
        <p className="text-sm font-semibold text-green-800">Document uploaded successfully</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={cn(
          "relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all",
          dragging ? "border-forest-500 bg-forest-50" : "border-gray-200 hover:border-forest-300 hover:bg-gray-50",
          file && "border-forest-400 bg-forest-50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {file ? (
          <div className="flex items-center gap-3 justify-center">
            {file.type.startsWith("image/") ? (
              <Image className="size-6 text-blue-500" />
            ) : (
              <FileText className="size-6 text-red-500" />
            )}
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="size-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Drop a file or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, WebP · Max {MAX_MB}MB</p>
          </>
        )}
      </div>

      {/* Document type */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Document type
        </label>
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-forest-500"
        >
          {DOC_TYPES.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Display name */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Label <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={DOC_TYPE_LABELS[docType]}
          maxLength={60}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-500"
        />
      </div>

      {/* Requires signature — agency staff only */}
      {uploaderRole === "agency_staff" && (
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setRequiresSignature(!requiresSignature)}
            className={cn(
              "h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
              requiresSignature ? "bg-forest-600 border-forest-600" : "border-gray-300"
            )}
          >
            {requiresSignature && <CheckCircle2 className="size-3 text-white" />}
          </div>
          <span className="text-sm text-gray-700">
            This document requires the patient's signature
          </span>
        </label>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!file || uploading}
          size="sm"
          className="flex-1 gap-2"
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {uploading ? "Uploading…" : "Upload document"}
        </Button>
      </div>
    </form>
  );
}
