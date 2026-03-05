"use client";

import * as React from "react";
import { Plus, Folder, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentCard } from "./document-card";
import { UploadDocumentForm } from "./upload-document-form";
import { ESignatureDrawer } from "./e-signature-drawer";
import type { DocumentRecord } from "@/lib/document-actions";

interface DocumentManagerProps {
  requestId: string;
  initialDocuments: DocumentRecord[];
  currentUserId: string;
  currentRole: "patient" | "agency_staff";
  patientFullName: string;
  canUpload?: boolean;
}

export function DocumentManager({
  requestId,
  initialDocuments,
  currentUserId,
  currentRole,
  patientFullName,
  canUpload = true,
}: DocumentManagerProps) {
  const [documents, setDocuments] = React.useState<DocumentRecord[]>(initialDocuments);
  const [showUpload, setShowUpload] = React.useState(false);
  const [signingDoc, setSigningDoc] = React.useState<DocumentRecord | null>(null);

  const pendingSignature = documents.filter((d) => d.requires_signature && !d.is_signed);
  const signed = documents.filter((d) => d.is_signed);
  const regular = documents.filter((d) => !d.requires_signature && !d.is_signed);

  function handleUploaded(doc: DocumentRecord) {
    setDocuments((prev) => [doc, ...prev]);
    setShowUpload(false);
  }

  function handleDeleted(docId: string) {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  }

  function handleSigned(docId: string) {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? { ...d, is_signed: true, signed_at: new Date().toISOString(), typed_name: signingDoc?.typed_name ?? d.typed_name }
          : d
      )
    );
    setSigningDoc(null);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-fraunces text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Folder className="size-5 text-forest-500" />
          Documents
          {documents.length > 0 && (
            <span className="text-sm font-normal text-gray-400">({documents.length})</span>
          )}
        </h3>
        {canUpload && !showUpload && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUpload(true)}
            className="gap-1.5"
          >
            <Plus className="size-3.5" />
            Upload document
          </Button>
        )}
        {showUpload && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUpload(false)}
            className="gap-1.5 text-gray-500"
          >
            <X className="size-3.5" />
            Cancel
          </Button>
        )}
      </div>

      {/* Pending-signature alert */}
      {currentRole === "patient" && pendingSignature.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{pendingSignature.length} document{pendingSignature.length > 1 ? "s" : ""}</span>
            {" "}require{pendingSignature.length === 1 ? "s" : ""} your signature.
          </p>
        </div>
      )}

      {/* Upload form */}
      {showUpload && (
        <div className="rounded-xl border border-forest-200 bg-forest-50/30 p-4">
          <UploadDocumentForm
            requestId={requestId}
            uploaderRole={currentRole}
            onUploaded={handleUploaded}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      )}

      {/* Document lists */}
      {documents.length === 0 && !showUpload ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center space-y-2">
          <Folder className="size-8 text-gray-300 mx-auto" />
          <p className="text-sm text-gray-500">No documents yet</p>
          {canUpload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUpload(true)}
              className="text-forest-600"
            >
              Upload the first document
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Needs signature */}
          {pendingSignature.length > 0 && (
            <section className="space-y-2">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Needs signature</p>
              {pendingSignature.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  currentUserId={currentUserId}
                  currentRole={currentRole}
                  onSign={(d) => setSigningDoc(d)}
                  onDeleted={handleDeleted}
                />
              ))}
            </section>
          )}

          {/* Regular docs */}
          {regular.length > 0 && (
            <section className="space-y-2">
              {pendingSignature.length > 0 && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Documents</p>
              )}
              {regular.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  currentUserId={currentUserId}
                  currentRole={currentRole}
                  onDeleted={handleDeleted}
                />
              ))}
            </section>
          )}

          {/* Signed */}
          {signed.length > 0 && (
            <section className="space-y-2">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Signed</p>
              {signed.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  currentUserId={currentUserId}
                  currentRole={currentRole}
                  onDeleted={handleDeleted}
                />
              ))}
            </section>
          )}
        </div>
      )}

      {/* E-signature drawer */}
      <ESignatureDrawer
        doc={signingDoc}
        patientFullName={patientFullName}
        onClose={() => setSigningDoc(null)}
        onSigned={handleSigned}
      />
    </div>
  );
}
