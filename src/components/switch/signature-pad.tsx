"use client";

import * as React from "react";
import { PenLine, Type, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SignaturePadProps {
  onSignatureChange: (data: {
    method: "typed" | "drawn";
    signatureName: string;
    signatureData?: string;
  }) => void;
  legalName?: string;
  error?: string;
}

export function SignaturePad({ onSignatureChange, legalName, error }: SignaturePadProps) {
  const [mode, setMode] = React.useState<"typed" | "drawn">("typed");
  const [typedName, setTypedName] = React.useState(legalName ?? "");
  const [hasDrawn, setHasDrawn] = React.useState(false);
  const [isDrawing, setIsDrawing] = React.useState(false);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const lastPos = React.useRef<{ x: number; y: number } | null>(null);

  // Emit changes
  React.useEffect(() => {
    if (mode === "typed") {
      onSignatureChange({ method: "typed", signatureName: typedName });
    }
  }, [typedName, mode]);

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * (canvas.width / rect.width),
        y: (touch.clientY - rect.top) * (canvas.height / rect.height),
      };
    }
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !lastPos.current) return;
    e.preventDefault();

    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1A3D2B";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
    setHasDrawn(true);
  }

  function endDraw() {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPos.current = null;

    // Emit the canvas data
    const canvas = canvasRef.current;
    if (canvas && hasDrawn) {
      const dataUrl = canvas.toDataURL("image/png");
      onSignatureChange({
        method: "drawn",
        signatureName: typedName || legalName || "",
        signatureData: dataUrl,
      });
    }
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSignatureChange({ method: "drawn", signatureName: typedName || legalName || "" });
  }

  function switchMode(newMode: "typed" | "drawn") {
    setMode(newMode);
    if (newMode === "typed") {
      onSignatureChange({ method: "typed", signatureName: typedName });
    } else {
      clearCanvas();
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex rounded-xl overflow-hidden border border-forest-200">
        {[
          { value: "typed" as const, label: "Type signature", icon: <Type className="size-3.5" /> },
          { value: "drawn" as const, label: "Draw signature", icon: <PenLine className="size-3.5" /> },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => switchMode(opt.value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors",
              mode === opt.value
                ? "bg-forest-600 text-white"
                : "bg-white text-forest-600 hover:bg-forest-50"
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>

      {/* Typed signature */}
      {mode === "typed" && (
        <div className="space-y-3">
          <Input
            label="Type your full legal name"
            placeholder="Jane Smith"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            error={!typedName && error ? error : undefined}
          />
          {typedName && (
            <div className="rounded-xl border-2 border-dashed border-forest-300 bg-cream p-6 text-center">
              <p
                className="text-3xl text-forest-800"
                style={{ fontFamily: "Fraunces, serif", fontStyle: "italic" }}
              >
                {typedName}
              </p>
              <p className="text-xs text-forest-400 mt-2">Signature preview</p>
            </div>
          )}
        </div>
      )}

      {/* Drawn signature */}
      {mode === "drawn" && (
        <div className="space-y-2">
          {!typedName && (
            <Input
              label="Your full legal name (required)"
              placeholder="Jane Smith"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
            />
          )}
          <div className="relative rounded-xl border-2 border-dashed border-forest-300 bg-cream overflow-hidden">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full touch-none cursor-crosshair"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-forest-300 text-sm">Sign here with your mouse or finger</p>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 border-t border-forest-200 mx-4" />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-forest-400">
              {hasDrawn ? (
                <span className="flex items-center gap-1 text-green-600">
                  <Check className="size-3" />
                  Signature captured
                </span>
              ) : (
                "Draw your signature above"
              )}
            </p>
            {hasDrawn && (
              <Button type="button" variant="ghost" size="sm" onClick={clearCanvas} className="gap-1 text-xs">
                <Trash2 className="size-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {error && !typedName && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Legal notice */}
      <div className="rounded-lg bg-forest-50 border border-forest-100 p-3 text-xs text-forest-500 leading-relaxed">
        By signing, you confirm that this is your legal signature and that you are authorizing 
        Chautari to process your home care agency switch request on your behalf.
        This electronic signature is legally binding under the Electronic Signatures in Global 
        and National Commerce Act (ESIGN).
      </div>
    </div>
  );
}
