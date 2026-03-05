"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSurveyByToken, submitSurveyResponse } from "@/lib/survey-actions";
import {
    CheckCircle2,
    Loader2,
    ThumbsUp,
    ThumbsDown,
    MessageCircle,
    XCircle,
} from "lucide-react";

const LEAVE_REASONS = [
    { value: "poor_communication", label: "Poor communication" },
    { value: "missed_visits", label: "Missed visits" },
    { value: "caregiver_quality", label: "Caregiver quality issues" },
    { value: "scheduling_issues", label: "Scheduling problems" },
    { value: "billing_problems", label: "Billing issues" },
    { value: "moved", label: "I moved" },
    { value: "insurance_change", label: "Insurance change" },
    { value: "care_needs_changed", label: "My care needs changed" },
    { value: "agency_closed", label: "Agency closed/lost contract" },
    { value: "other", label: "Other" },
];

export default function SurveyPage() {
    const params = useParams();
    const token = params.id as string;

    const [loading, setLoading] = useState(true);
    const [survey, setSurvey] = useState<any>(null);
    const [notFound, setNotFound] = useState(false);

    const [q1, setQ1] = useState<boolean | null>(null);
    const [q2, setQ2] = useState<boolean | null>(null);
    const [q3, setQ3] = useState("");
    const [q4, setQ4] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        getSurveyByToken(token).then((data) => {
            if (data) {
                setSurvey(data);
            } else {
                setNotFound(true);
            }
            setLoading(false);
        });
    }, [token]);

    async function handleSubmit() {
        if (q1 === null || q2 === null) {
            setError("Please answer all required questions.");
            return;
        }

        setSubmitting(true);
        setError("");

        const result = await submitSurveyResponse(token, {
            q1_better: q1,
            q2_recommend: q2,
            q3_comment: q3 || undefined,
            q4_leave_reason: q4 || undefined,
        });

        setSubmitting(false);

        if (result.error) {
            setError(result.error);
        } else {
            setSubmitted(true);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-forest-600 animate-spin" />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center px-4">
                <div className="max-w-md text-center space-y-4">
                    <XCircle className="w-12 h-12 text-forest-400 mx-auto" />
                    <h1 className="font-fraunces text-2xl font-semibold text-forest-800">
                        Survey not found
                    </h1>
                    <p className="text-forest-500">
                        This survey link may have expired or already been completed.
                    </p>
                    <Link href="/" className="text-forest-600 hover:text-forest-800 text-sm underline">
                        Go to SwitchMyCare
                    </Link>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center px-4">
                <div className="max-w-md bg-white rounded-2xl shadow-lg p-8 text-center space-y-5">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h1 className="font-fraunces text-2xl font-semibold text-forest-800">
                        Thank you for your feedback!
                    </h1>
                    <p className="text-forest-500 text-sm">
                        Your response helps other patients and helps agencies improve their care.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-forest-700 text-white font-medium rounded-xl px-5 py-2.5 hover:bg-forest-800 transition-colors"
                    >
                        Visit SwitchMyCare
                    </Link>
                </div>
            </div>
        );
    }

    const agencyName = survey?.destination_agency?.name ?? "your new agency";

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
            <div className="max-w-lg w-full space-y-6">
                <div className="text-center space-y-2">
                    <MessageCircle className="w-10 h-10 text-forest-600 mx-auto" />
                    <h1 className="font-fraunces text-2xl font-semibold text-forest-800">
                        How&apos;s your experience with {agencyName}?
                    </h1>
                    <p className="text-forest-500 text-sm">
                        It&apos;s been 30 days since your switch. This takes less than a minute.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-forest-100 p-6 space-y-6">
                    {/* Q1 */}
                    <div className="space-y-3">
                        <p className="font-medium text-forest-800">
                            1. Is your new agency better than your old one? <span className="text-red-500">*</span>
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setQ1(true)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-all ${q1 === true
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                                    : "border-forest-200 text-forest-500 hover:border-forest-400"
                                    }`}
                            >
                                <ThumbsUp className="w-5 h-5" /> Yes
                            </button>
                            <button
                                onClick={() => setQ1(false)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-all ${q1 === false
                                    ? "bg-red-50 border-red-400 text-red-800"
                                    : "border-forest-200 text-forest-500 hover:border-forest-400"
                                    }`}
                            >
                                <ThumbsDown className="w-5 h-5" /> No
                            </button>
                        </div>
                    </div>

                    {/* Q2 */}
                    <div className="space-y-3">
                        <p className="font-medium text-forest-800">
                            2. Would you recommend {agencyName}? <span className="text-red-500">*</span>
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setQ2(true)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-all ${q2 === true
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                                    : "border-forest-200 text-forest-500 hover:border-forest-400"
                                    }`}
                            >
                                <ThumbsUp className="w-5 h-5" /> Yes
                            </button>
                            <button
                                onClick={() => setQ2(false)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-all ${q2 === false
                                    ? "bg-red-50 border-red-400 text-red-800"
                                    : "border-forest-200 text-forest-500 hover:border-forest-400"
                                    }`}
                            >
                                <ThumbsDown className="w-5 h-5" /> No
                            </button>
                        </div>
                    </div>

                    {/* Q4 */}
                    <div className="space-y-2">
                        <p className="font-medium text-forest-800">
                            3. Why did you leave your previous agency? <span className="text-forest-400 text-xs">(optional)</span>
                        </p>
                        <select
                            value={q4}
                            onChange={(e) => setQ4(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-forest-200 focus:border-forest-500 focus:ring-1 focus:ring-forest-500 text-sm outline-none bg-white"
                        >
                            <option value="">Select a reason</option>
                            {LEAVE_REASONS.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Q3 */}
                    <div className="space-y-2">
                        <p className="font-medium text-forest-800">
                            4. Anything else you&apos;d like to share? <span className="text-forest-400 text-xs">(optional)</span>
                        </p>
                        <textarea
                            value={q3}
                            onChange={(e) => setQ3(e.target.value.slice(0, 1000))}
                            rows={3}
                            placeholder="Your feedback helps others..."
                            className="w-full px-3 py-2 rounded-lg border border-forest-200 focus:border-forest-500 focus:ring-1 focus:ring-forest-500 text-sm outline-none resize-none"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full bg-forest-700 hover:bg-forest-800 text-white font-medium rounded-xl px-5 py-3 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                            </>
                        ) : (
                            "Submit feedback"
                        )}
                    </button>

                    <p className="text-xs text-center text-forest-400">
                        Your responses are confidential and used to improve care quality. No identifying info is shared with agencies.
                    </p>
                </div>
            </div>
        </div>
    );
}
