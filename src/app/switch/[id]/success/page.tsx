"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { confirmSwitchPayment } from "@/lib/payment-actions";
import { CheckCircle2, Loader2, XCircle, ArrowRight, Home, FileText } from "lucide-react";

export default function PaymentSuccessPage({
    params,
}: {
    params: { id: string };
}) {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!sessionId) {
            setStatus("error");
            setErrorMsg("No payment session found.");
            return;
        }

        confirmSwitchPayment(sessionId).then((result) => {
            if (result.success) {
                setStatus("success");
            } else {
                setStatus("error");
                setErrorMsg(result.error || "Payment verification failed.");
            }
        });
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {status === "loading" && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
                        <Loader2 className="w-12 h-12 text-forest-600 mx-auto animate-spin" />
                        <h1 className="font-fraunces text-2xl font-semibold text-forest-800">
                            Verifying payment...
                        </h1>
                        <p className="text-forest-500 text-sm">
                            Please wait while we confirm your payment with Stripe.
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-6">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="font-fraunces text-2xl font-semibold text-forest-800">
                                Payment confirmed!
                            </h1>
                            <p className="text-forest-500">
                                Your $97 switch fee has been processed. Your agency switch request is now submitted and under review.
                            </p>
                        </div>

                        <div className="bg-forest-50 rounded-xl p-4 text-left space-y-3">
                            <h3 className="font-semibold text-forest-800 text-sm">What happens next</h3>
                            <div className="space-y-2 text-sm text-forest-600">
                                <div className="flex items-start gap-2">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-forest-200 text-forest-800 text-xs font-bold shrink-0 mt-0.5">1</span>
                                    <p>The agency will review your request (typically within 24-48 hours).</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-forest-200 text-forest-800 text-xs font-bold shrink-0 mt-0.5">2</span>
                                    <p>Once accepted, we&apos;ll coordinate the care plan transfer.</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-forest-200 text-forest-800 text-xs font-bold shrink-0 mt-0.5">3</span>
                                    <p>You&apos;ll get email + dashboard notifications at every step.</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-forest-400 bg-forest-50/50 rounded-lg p-3">
                            <strong>Refund policy:</strong> Full refund if cancelled within 24 hours, or if no agency responds within 14 days.
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center justify-center gap-2 bg-forest-700 hover:bg-forest-800 text-white font-medium rounded-xl px-6 py-3 transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                Go to Dashboard
                            </Link>
                            <Link
                                href={`/switch/${params.id}`}
                                className="inline-flex items-center justify-center gap-2 text-forest-600 hover:text-forest-800 font-medium text-sm py-2 transition-colors"
                            >
                                <FileText className="w-4 h-4" />
                                View request details
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                )}

                {status === "error" && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h1 className="font-fraunces text-2xl font-semibold text-forest-800">
                            Payment issue
                        </h1>
                        <p className="text-forest-500 text-sm">{errorMsg}</p>
                        <div className="flex flex-col gap-2 pt-2">
                            <Link
                                href={`/switch/${params.id}`}
                                className="inline-flex items-center justify-center gap-2 bg-forest-700 hover:bg-forest-800 text-white font-medium rounded-xl px-6 py-3 transition-colors"
                            >
                                Try again
                            </Link>
                            <Link
                                href="/dashboard"
                                className="text-forest-600 hover:text-forest-800 text-sm font-medium py-2 transition-colors"
                            >
                                Back to dashboard
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
