"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { submitWage, searchAgenciesForAutocomplete } from "@/lib/wage-submission-actions";
import { Logo } from "@/components/ui/logo";
import {
    DollarSign,
    CheckCircle2,
    Star,
    Loader2,
    Search,
    ArrowLeft,
    Heart,
    Shield,
} from "lucide-react";

const ROLES = [
    { value: "HHA", label: "Home Health Aide (HHA)" },
    { value: "CNA", label: "Certified Nursing Assistant (CNA)" },
    { value: "PCA", label: "Personal Care Aide (PCA)" },
    { value: "LPN", label: "Licensed Practical Nurse (LPN)" },
    { value: "RN", label: "Registered Nurse (RN)" },
    { value: "PT", label: "Physical Therapist (PT)" },
    { value: "OT", label: "Occupational Therapist (OT)" },
    { value: "SLP", label: "Speech-Language Pathologist (SLP)" },
    { value: "MSW", label: "Medical Social Worker (MSW)" },
];

const BENEFITS = [
    { key: "health_insurance", label: "Health Insurance" },
    { key: "dental", label: "Dental" },
    { key: "vision", label: "Vision" },
    { key: "pto", label: "Paid Time Off" },
    { key: "mileage", label: "Mileage Reimbursement" },
    { key: "retirement_401k", label: "401(k) / Retirement" },
    { key: "sign_on_bonus", label: "Sign-on Bonus" },
    { key: "flexible_schedule", label: "Flexible Scheduling" },
    { key: "paid_training", label: "Paid Training" },
    { key: "none", label: "No benefits offered" },
];

const EMPLOYMENT_TYPES = [
    { value: "full_time", label: "Full-time" },
    { value: "part_time", label: "Part-time" },
    { value: "prn", label: "PRN / Per diem" },
];

function StarRating({
    value,
    onChange,
    label,
}: {
    value: number;
    onChange: (v: number) => void;
    label: string;
}) {
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-forest-700">{label}</label>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className="p-0.5 transition-transform hover:scale-110"
                    >
                        <Star
                            className={`w-6 h-6 ${star <= value
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-300"
                                }`}
                        />
                    </button>
                ))}
                <span className="text-xs text-forest-400 ml-2 self-center">
                    {value > 0 ? `${value}/5` : ""}
                </span>
            </div>
        </div>
    );
}

export default function SubmitWagesPage() {
    const searchParams = useSearchParams();
    const preselectedAgencyId = searchParams.get("agency");
    const pageLoadTime = useRef(Date.now());

    // Form state
    const [agencyQuery, setAgencyQuery] = useState("");
    const [agencySuggestions, setAgencySuggestions] = useState<
        { id: string; name: string }[]
    >([]);
    const [selectedAgency, setSelectedAgency] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [role, setRole] = useState("");
    const [employmentType, setEmploymentType] = useState("");
    const [hourlyRate, setHourlyRate] = useState("");
    const [yearsAtAgency, setYearsAtAgency] = useState("");
    const [benefits, setBenefits] = useState<Record<string, boolean>>({});
    const [managementScore, setManagementScore] = useState(0);
    const [trainingScore, setTrainingScore] = useState(0);
    const [schedulingScore, setSchedulingScore] = useState(0);
    const [comment, setComment] = useState("");
    const [honeypot, setHoneypot] = useState(""); // Anti-bot

    // UI state
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Agency autocomplete
    useEffect(() => {
        if (agencyQuery.length < 2) {
            setAgencySuggestions([]);
            return;
        }
        const timeout = setTimeout(async () => {
            const results = await searchAgenciesForAutocomplete(agencyQuery);
            setAgencySuggestions(results);
            setShowSuggestions(true);
        }, 300);
        return () => clearTimeout(timeout);
    }, [agencyQuery]);

    // Preselect agency if ID provided in URL
    useEffect(() => {
        if (preselectedAgencyId) {
            searchAgenciesForAutocomplete(preselectedAgencyId).then((results) => {
                // Try to find by ID — fallback to first result
                const match = results.find((r) => r.id === preselectedAgencyId);
                if (match) {
                    setSelectedAgency(match);
                    setAgencyQuery(match.name);
                }
            });
        }
    }, [preselectedAgencyId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        // Anti-bot honeypot
        if (honeypot) return;

        if (!selectedAgency) {
            setError("Please select an agency.");
            return;
        }
        if (!role) {
            setError("Please select your role.");
            return;
        }
        if (!hourlyRate || parseFloat(hourlyRate) < 7.25) {
            setError("Please enter a valid hourly rate ($7.25+).");
            return;
        }
        if (managementScore === 0) {
            setError("Please rate management quality (1-5 stars).");
            return;
        }

        setSubmitting(true);
        const timeOnPage = Math.floor((Date.now() - pageLoadTime.current) / 1000);

        const result = await submitWage({
            agencyId: selectedAgency.id,
            role,
            employmentType,
            actualHourlyRate: parseFloat(hourlyRate),
            yearsAtAgency: yearsAtAgency ? parseFloat(yearsAtAgency) : undefined,
            benefits,
            managementScore,
            trainingScore: trainingScore > 0 ? trainingScore : undefined,
            schedulingScore: schedulingScore > 0 ? schedulingScore : undefined,
            commentText: comment || undefined,
            timeOnPageSeconds: timeOnPage,
        });

        setSubmitting(false);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(true);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-5">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h1 className="font-fraunces text-2xl font-semibold text-forest-800">
                        Thank you!
                    </h1>
                    <p className="text-forest-500 text-sm">
                        Your submission helps caregivers make informed decisions. It will be
                        reviewed within 48 hours before appearing on the agency&apos;s profile.
                    </p>
                    <div className="bg-forest-50 rounded-xl p-4 text-left text-sm text-forest-600">
                        <p className="font-medium text-forest-800 mb-1">Your privacy is protected</p>
                        <p>We never store your IP address or any identifying information. Your submission is completely anonymous.</p>
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                        <Link
                            href="/agencies"
                            className="inline-flex items-center justify-center gap-2 bg-forest-700 text-white font-medium rounded-xl px-5 py-2.5 hover:bg-forest-800 transition-colors"
                        >
                            Browse agencies
                        </Link>
                        <button
                            onClick={() => {
                                setSuccess(false);
                                setSelectedAgency(null);
                                setAgencyQuery("");
                                setRole("");
                                setHourlyRate("");
                                setManagementScore(0);
                                setComment("");
                                setBenefits({});
                                pageLoadTime.current = Date.now();
                            }}
                            className="text-forest-600 hover:text-forest-800 text-sm font-medium py-2 transition-colors"
                        >
                            Submit for another agency
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream">
            {/* Nav */}
            <nav className="bg-white border-b border-forest-100 px-4 py-3 sticky top-0 z-30">
                <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
                    <Logo size="sm" />
                    <Link
                        href="/agencies"
                        className="text-sm text-forest-600 hover:text-forest-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 inline mr-1" />
                        Back to directory
                    </Link>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center space-y-3 mb-8">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                        <DollarSign className="w-6 h-6 text-amber-600" />
                    </div>
                    <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
                        Share your pay info
                    </h1>
                    <p className="text-forest-500 max-w-md mx-auto">
                        Help other caregivers know what agencies really pay. Your submission
                        is <strong>100% anonymous</strong> — we never store identifying info.
                    </p>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap justify-center gap-4 mb-8 text-xs text-forest-500">
                    <span className="inline-flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-emerald-600" /> Anonymous
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500" /> Helps caregivers
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" /> No login required
                    </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-forest-100 p-6 space-y-6">
                    {/* Honeypot — hidden from users, catches bots */}
                    <input
                        type="text"
                        name="website_url"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        style={{ position: "absolute", left: "-9999px", opacity: 0 }}
                        tabIndex={-1}
                        autoComplete="off"
                    />

                    {/* Agency search */}
                    <div className="space-y-1.5 relative">
                        <label className="text-sm font-medium text-forest-700">
                            Agency name <span className="text-red-500">*</span>
                        </label>
                        {selectedAgency ? (
                            <div className="flex items-center gap-2 bg-forest-50 rounded-lg px-3 py-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="text-sm text-forest-800 font-medium">
                                    {selectedAgency.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedAgency(null);
                                        setAgencyQuery("");
                                    }}
                                    className="ml-auto text-xs text-forest-500 hover:text-forest-700"
                                >
                                    Change
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                                    <input
                                        type="text"
                                        value={agencyQuery}
                                        onChange={(e) => setAgencyQuery(e.target.value)}
                                        onFocus={() => agencySuggestions.length > 0 && setShowSuggestions(true)}
                                        placeholder="Search for an agency..."
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-forest-200 focus:border-forest-500 focus:ring-1 focus:ring-forest-500 text-sm outline-none"
                                    />
                                </div>
                                {showSuggestions && agencySuggestions.length > 0 && (
                                    <div className="absolute z-20 w-full bg-white border border-forest-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                                        {agencySuggestions.map((agency) => (
                                            <button
                                                key={agency.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedAgency(agency);
                                                    setAgencyQuery(agency.name);
                                                    setShowSuggestions(false);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm text-forest-700 hover:bg-forest-50 transition-colors"
                                            >
                                                {agency.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Role */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-forest-700">
                            Your role <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-forest-200 focus:border-forest-500 focus:ring-1 focus:ring-forest-500 text-sm outline-none bg-white"
                        >
                            <option value="">Select your role</option>
                            {ROLES.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Employment type */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-forest-700">Employment type</label>
                        <div className="flex gap-2 flex-wrap">
                            {EMPLOYMENT_TYPES.map((et) => (
                                <button
                                    key={et.value}
                                    type="button"
                                    onClick={() => setEmploymentType(et.value)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${employmentType === et.value
                                            ? "bg-forest-700 text-white border-forest-700"
                                            : "bg-white text-forest-600 border-forest-200 hover:border-forest-400"
                                        }`}
                                >
                                    {et.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hourly rate */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-forest-700">
                            Your actual hourly rate <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                            <input
                                type="number"
                                step="0.25"
                                min="7.25"
                                max="75"
                                value={hourlyRate}
                                onChange={(e) => setHourlyRate(e.target.value)}
                                placeholder="e.g. 16.50"
                                className="w-full pl-9 pr-16 py-2 rounded-lg border border-forest-200 focus:border-forest-500 focus:ring-1 focus:ring-forest-500 text-sm outline-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-forest-400">
                                per hour
                            </span>
                        </div>
                    </div>

                    {/* Years at agency */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-forest-700">
                            Years at this agency <span className="text-forest-400 text-xs">(optional)</span>
                        </label>
                        <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="50"
                            value={yearsAtAgency}
                            onChange={(e) => setYearsAtAgency(e.target.value)}
                            placeholder="e.g. 2.5"
                            className="w-full px-3 py-2 rounded-lg border border-forest-200 focus:border-forest-500 focus:ring-1 focus:ring-forest-500 text-sm outline-none"
                        />
                    </div>

                    {/* Benefits */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-forest-700">Benefits received</label>
                        <div className="grid grid-cols-2 gap-2">
                            {BENEFITS.map((b) => (
                                <label
                                    key={b.key}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${benefits[b.key]
                                            ? "bg-forest-50 border-forest-400 text-forest-800"
                                            : "bg-white border-forest-200 text-forest-500 hover:border-forest-300"
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={benefits[b.key] || false}
                                        onChange={(e) =>
                                            setBenefits((prev) => ({
                                                ...prev,
                                                [b.key]: e.target.checked,
                                            }))
                                        }
                                        className="sr-only"
                                    />
                                    <div
                                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${benefits[b.key]
                                                ? "bg-forest-700 border-forest-700"
                                                : "border-forest-300"
                                            }`}
                                    >
                                        {benefits[b.key] && (
                                            <CheckCircle2 className="w-3 h-3 text-white" />
                                        )}
                                    </div>
                                    {b.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Ratings */}
                    <div className="space-y-4">
                        <StarRating
                            value={managementScore}
                            onChange={setManagementScore}
                            label="Management quality *"
                        />
                        <StarRating
                            value={trainingScore}
                            onChange={setTrainingScore}
                            label="Training & support (optional)"
                        />
                        <StarRating
                            value={schedulingScore}
                            onChange={setSchedulingScore}
                            label="Scheduling fairness (optional)"
                        />
                    </div>

                    {/* Comment */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-forest-700">
                            Any comments?{" "}
                            <span className="text-forest-400 text-xs">(optional, max 500 chars)</span>
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value.slice(0, 500))}
                            rows={3}
                            placeholder="What's it like working here? Any tips for others?"
                            className="w-full px-3 py-2 rounded-lg border border-forest-200 focus:border-forest-500 focus:ring-1 focus:ring-forest-500 text-sm outline-none resize-none"
                        />
                        <p className="text-xs text-forest-400 text-right">
                            {comment.length}/500
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-forest-700 hover:bg-forest-800 text-white font-medium rounded-xl px-5 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Heart className="w-4 h-4" />
                                Submit anonymously
                            </>
                        )}
                    </button>

                    <p className="text-xs text-center text-forest-400">
                        Your submission is reviewed within 48 hours. We never store your IP or identity.
                    </p>
                </form>
            </div>
        </div>
    );
}
