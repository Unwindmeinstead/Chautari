"use client";

import * as React from "react";
import {
  FileText, Image, Download, Trash2, PenLine,
  CheckCircle2, Clock, AlertCircle, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDocumentUrl, deleteDocument } from "@/lib/document-actions";
import { DOC_TYPE_LABELS } from "@/lib/constants";
import type { DocumentRecord } from "@/lib/document-actions";

interface DocumentCardProps {
  doc: DocumentRecord;
  currentUserId: string;
  currentRole: "patient" | "agency_staff";
  onSign?: (doc: DocumentRecord) => void;
  onDeleted?: (docId: string) => void;
}

function fileIcon(mimeType: string | null) {
  if (mimeType?.startsWith("image/")) return <Image className="size-5 text-blue-500" />;
  return <FileText className="size-5 text-red-500" />;
}

function fileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DocumentCard({ doc, currentUserId, currentRole, onSign, onDeleted }: DocumentCardProps) {
  const [downloading, setDownloading] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canDelete = doc.uploaded_by === currentUserId && !doc.is_signed;
  const canSign = currentRole === "patient" && doc.requires_signature && !doc.is_signed;
  const uploadedAt = new Date(doc.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    const result = await getDocumentUrl(doc.id);
    setDownloading(false);
    if (result.error) { setError(result.error); return; }
    window.open(result.url, "_blank");
  }

  async function handleDelete() {
    if (!confirm(`Delete "${doc.display_name}"? This cannot be undone.`)) return;
    setDeleting(true);
    const result = await deleteDocument(doc.id);
    setDeleting(false);
    if (result.error) { setError(result.error); return; }
    onDeleted?.(doc.id);
  }

  return (
    <div className={cn(
      "rounded-xl border bg-white p-4 space-y-3 transition-shadow hover:shadow-sm",
      doc.requires_signature && !doc.is_signed
        ? "border-amber-200 bg-amber-50/30"
        : "border-gray-200"
    )}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
          {fileIcon(doc.mime_type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{doc.display_name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type} · {fileSize(doc.file_size_bytes)} · {uploadedAt}
          </p>
        </div>

        {/* Signature status badge */}
        {doc.requires_signature ? (
          doc.is_signed ? (
            <Badge variant="success" className="shrink-0 gap-1">
              <CheckCircle2 className="size-3" /> Signed
            </Badge>
          ) : (
            <Badge variant="warning" className="shrink-0 gap-1 animate-pulse">
              <Clock className="size-3" /> Needs signature
            </Badge>
          )
        ) : (
          <Badge variant="secondary" className="shrink-0">
            {doc.uploader_role === "agency_staff" ? "From agency" : "Uploaded"}
          </Badge>
        )}
      </div>

      {/* Signed-by info */}
      {doc.is_signed && doc.typed_name && (
        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
          <CheckCircle2 className="size-3.5 shrink-0" />
          Signed by <span className="font-semibold italic">{doc.typed_name}</span>
          {doc.signed_at && (
            <span className="text-green-500">
              · {new Date(doc.signed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600">
          <AlertCircle className="size-3.5" /> {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={downloading}
          className="gap-1.5 text-xs h-8"
        >
          {downloading ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />}
          View / Download
        </Button>

        {canSign && onSign && (
          <Button
            variant="amber"
            size="sm"
            onClick={() => onSign(doc)}
            className="gap-1.5 text-xs h-8"
          >
            <PenLine className="size-3" />
            Sign document
          </Button>
        )}

        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="gap-1.5 text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-50 ml-auto"
          >
            {deleting ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
