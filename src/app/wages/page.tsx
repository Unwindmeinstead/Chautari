"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { CheckCircle2, Loader2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";

const ROLES = ["HHA", "CNA", "LPN", "RN", "PT", "OT", "other"] as const;
const EMPLOYMENT_TYPES = ["full_time", "part_time", "prn"] as const;
const BENEFITS = ["health", "dental", "pto", "mileage", "retirement", "sign_on_bonus"] as const;

const schema = z.object({
    agency_name: z.string().min(2, "Agency name required"),
    role: z.enum(ROLES, { errorMap: () => ({ message: "Select your role" }) }),
    employment_type: z.enum(EMPLOYMENT_TYPES).optional(),
    actual_hourly_rate: z
        .number({ invalid_type_error: "Enter your hourly rate" })
        .min(7.25, "Must be at least $7.25")
        .max(75, "Must be under $75"),
    benefits: z.array(z.string()).optional(),
    management_score: z.number().min(1).max(5).optional(),
    comment_text: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

export default function WagesPage() {
    const [submitted, setSubmitted] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [mgmtScore, setMgmtScore] = React.useState<number | null>(null);
    const startTime = React.useRef(Date.now());

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const selectedBenefits = watch("benefits") ?? [];

    function toggleBenefit(b: string) {
        const current = selectedBenefits;
        if (current.includes(b)) {
            setValue("benefits", current.filter((x) => x !== b));
        } else {
            setValue("benefits", [...current, b]);
        }
    }

    async function onSubmit(data: FormData) {
        setSubmitting(true);
        setError(null);
        const timeOnPage = Math.round((Date.now() - startTime.current) / 1000);

        try {
            const res = await fetch("/api/wages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, time_on_page_seconds: timeOnPage }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "Submission failed");
            setSubmitted(true);
        } catch (err: any) {
            setError(err.message ?? "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="size-10 text-green-600" />
                    </div>
                    <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
                        Thank you — that helps.
                    </h1>
                    <p className="text-forest-500 leading-relaxed">
                        Your anonymous submission will help other caregivers and patients understand
                        what agencies actually pay. It goes into moderation and appears on agency
                        profiles within 48 hours after verification.
                    </p>
                    <Button asChild>
                        <Link href="/agencies">Browse agencies</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream">
            <nav className="bg-white border-b border-forest-100 px-4 py-3">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <Logo size="sm" />
                    <Link href="/agencies" className="text-sm text-forest-500 hover:text-forest-700">
                        Back to agencies
                    </Link>
                </div>
            </nav>

            <div className="max-w-xl mx-auto px-4 py-12 space-y-8">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                        <DollarSign className="size-3.5" />
                        100% anonymous · No login required
                    </div>
                    <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
                        Share what your agency pays
                    </h1>
                    <p className="text-forest-500 leading-relaxed">
                        Patients choose agencies partly based on how caregivers are treated.
                        Your anonymous report helps everyone make better decisions.
                        We never store your name, IP address, or any identifying information.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Agency name */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-forest-700">Agency name *</label>
                        <Input
                            {...register("agency_name")}
                            placeholder="e.g. BAYADA Home Health Care"
                            className="bg-white"
                        />
                        {errors.agency_name && (
                            <p className="text-xs text-red-600">{errors.agency_name.message}</p>
                        )}
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-forest-700">Your role *</label>
                        <div className="flex flex-wrap gap-2">
                            {ROLES.map((r) => (
                                <label key={r} className="cursor-pointer">
                                    <input type="radio" value={r} {...register("role")} className="sr-only peer" />
                                    <span className="peer-checked:bg-forest-600 peer-checked:text-white peer-checked:border-forest-600 border border-forest-200 rounded-lg px-3 py-1.5 text-sm text-forest-700 hover:border-forest-400 transition-colors">
                                        {r}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {errors.role && <p className="text-xs text-red-600">{errors.role.message}</p>}
                    </div>

                    {/* Employment type */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-forest-700">Employment type</label>
                        <div className="flex gap-2">
                            {EMPLOYMENT_TYPES.map((t) => (
                                <label key={t} className="cursor-pointer">
                                    <input type="radio" value={t} {...register("employment_type")} className="sr-only peer" />
                                    <span className="peer-checked:bg-forest-600 peer-checked:text-white peer-checked:border-forest-600 border border-forest-200 rounded-lg px-3 py-1.5 text-sm text-forest-700 hover:border-forest-400 transition-colors">
                                        {t.replace("_", " ")}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Hourly rate */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-forest-700">Your actual hourly rate *</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400 font-medium">$</span>
                            <Input
                                type="number"
                                step="0.25"
                                min="7.25"
                                max="75"
                                placeholder="15.50"
                                className="pl-7 bg-white"
                                {...register("actual_hourly_rate", { valueAsNumber: true })}
                            />
                        </div>
                        {errors.actual_hourly_rate && (
                            <p className="text-xs text-red-600">{errors.actual_hourly_rate.message}</p>
                        )}
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-forest-700">Benefits you receive</label>
                        <div className="flex flex-wrap gap-2">
                            {BENEFITS.map((b) => (
                                <button
                                    key={b}
                                    type="button"
                                    onClick={() => toggleBenefit(b)}
                                    className={`border rounded-lg px-3 py-1.5 text-sm transition-colors ${selectedBenefits.includes(b)
                                            ? "bg-forest-600 text-white border-forest-600"
                                            : "border-forest-200 text-forest-700 hover:border-forest-400"
                                        }`}
                                >
                                    {b.replace(/_/g, " ")}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Management score */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-forest-700">
                            How would you rate management? (1 = poor, 5 = excellent)
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => { setMgmtScore(n); setValue("management_score", n); }}
                                    className={`h-10 w-10 rounded-xl border text-sm font-semibold transition-colors ${mgmtScore === n
                                            ? "bg-amber-500 text-white border-amber-500"
                                            : "border-forest-200 text-forest-700 hover:border-amber-400"
                                        }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Optional comment */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-forest-700">
                            Anything else to add? <span className="text-forest-400 font-normal">(optional, max 500 chars)</span>
                        </label>
                        <textarea
                            {...register("comment_text")}
                            rows={3}
                            maxLength={500}
                            placeholder="e.g. They're very good about mileage reimbursement but scheduling is unpredictable…"
                            className="w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm text-forest-800 placeholder:text-forest-300 focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
                        />
                        {errors.comment_text && (
                            <p className="text-xs text-red-600">{errors.comment_text.message}</p>
                        )}
                    </div>

                    {error && (
                        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                        {submitting ? (
                            <><Loader2 className="size-4 animate-spin" /> Submitting…</>
                        ) : (
                            "Submit anonymously"
                        )}
                    </Button>

                    <p className="text-xs text-center text-forest-400">
                        We store a one-way hash of your browser fingerprint only to prevent duplicate submissions.
                        No name, email, or IP is stored.
                    </p>
                </form>
            </div>
        </div>
    );
}
