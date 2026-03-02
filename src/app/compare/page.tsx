import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Agency } from "@/types/database";
import type { Metadata } from "next";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Star, Clock, MapPin, DollarSign, Globe, Phone, ShieldCheck, Users } from "lucide-react";

interface ComparePageProps {
    searchParams: { a?: string; b?: string; c?: string };
}

async function getAgencies(ids: string[]): Promise<Agency[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("agencies")
        .select("*")
        .in("id", ids)
        .eq("is_active", true);

    if (error || !data) return [];
    return data as Agency[];
}

export async function generateMetadata({
    searchParams,
}: ComparePageProps): Promise<Metadata> {
    const ids = [searchParams.a, searchParams.b, searchParams.c].filter(Boolean) as string[];
    if (ids.length < 2) {
        return { title: "Compare Agencies | SwitchMyCare" };
    }
    const agencies = await getAgencies(ids);
    const names = agencies.map((a) => a.name).join(" vs ");
    return {
        title: `Compare ${names} — Ratings, Pay, Services | SwitchMyCare`,
        description: `Side-by-side comparison of ${names}. Compare ratings, caregiver pay rates, services offered, and more on SwitchMyCare.`,
    };
}

function CompareCell({
    values,
    compareFn,
    renderFn,
}: {
    values: (string | number | null | undefined)[];
    compareFn?: (a: any, b: any) => number;
    renderFn: (val: any, isBest: boolean) => React.ReactNode;
}) {
    // Find best value
    let bestIdx = -1;
    if (compareFn) {
        const validValues = values.map((v, i) => ({ v, i })).filter((x) => x.v != null);
        if (validValues.length > 1) {
            validValues.sort((a, b) => compareFn(a.v, b.v));
            bestIdx = validValues[validValues.length - 1].i;
        }
    }

    return (
        <>
            {values.map((val, i) => (
                <td
                    key={i}
                    className={`px-4 py-3 text-sm ${i === bestIdx
                        ? "bg-emerald-50 text-emerald-800 font-semibold"
                        : "text-forest-700"
                        }`}
                >
                    <div className="flex items-center gap-1">
                        {renderFn(val, i === bestIdx)}
                        {i === bestIdx && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                    </div>
                </td>
            ))}
        </>
    );
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
    const ids = [searchParams.a, searchParams.b, searchParams.c].filter(Boolean) as string[];

    if (ids.length < 2) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center px-4">
                <div className="max-w-md text-center space-y-4">
                    <h1 className="font-fraunces text-2xl font-semibold text-forest-800">
                        Compare agencies
                    </h1>
                    <p className="text-forest-500">
                        Select 2-3 agencies from the{" "}
                        <Link href="/agencies" className="text-forest-700 underline">
                            directory
                        </Link>{" "}
                        to compare them side by side.
                    </p>
                    <Link
                        href="/agencies"
                        className="inline-flex items-center gap-2 bg-forest-700 text-white font-medium rounded-xl px-5 py-2.5 hover:bg-forest-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Browse agencies
                    </Link>
                </div>
            </div>
        );
    }

    const agencies = await getAgencies(ids);

    if (agencies.length < 2) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center px-4">
                <div className="max-w-md text-center space-y-4">
                    <h1 className="font-fraunces text-2xl font-semibold text-forest-800">
                        Agencies not found
                    </h1>
                    <p className="text-forest-500">
                        One or more of the selected agencies could not be loaded.
                    </p>
                    <Link
                        href="/agencies"
                        className="inline-flex items-center gap-2 bg-forest-700 text-white font-medium rounded-xl px-5 py-2.5 hover:bg-forest-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to directory
                    </Link>
                </div>
            </div>
        );
    }

    const rows: {
        label: string;
        icon: React.ReactNode;
        values: (string | number | null | undefined)[];
        compareFn?: (a: any, b: any) => number;
        renderFn: (val: any, isBest: boolean) => React.ReactNode;
    }[] = [
            {
                label: "Google Rating",
                icon: <Star className="w-4 h-4" />,
                values: agencies.map((a) => a.google_rating),
                compareFn: (a: number, b: number) => a - b,
                renderFn: (val: number | null) =>
                    val != null ? (
                        <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {val.toFixed(1)}
                        </span>
                    ) : (
                        <span className="text-forest-300">—</span>
                    ),
            },
            {
                label: "CMS Quality Score",
                icon: <ShieldCheck className="w-4 h-4" />,
                values: agencies.map((a) => a.medicare_quality_score),
                compareFn: (a: number, b: number) => a - b,
                renderFn: (val: number | null) =>
                    val != null ? `${val}/5` : <span className="text-forest-300">—</span>,
            },
            {
                label: "Avg Response Time",
                icon: <Clock className="w-4 h-4" />,
                values: agencies.map((a) => a.avg_response_hours),
                compareFn: (a: number, b: number) => b - a, // Lower is better
                renderFn: (val: number | null) =>
                    val != null ? `${val}h` : <span className="text-forest-300">—</span>,
            },
            {
                label: "Google Reviews",
                icon: <Users className="w-4 h-4" />,
                values: agencies.map((a) => a.google_reviews_count),
                compareFn: (a: number, b: number) => a - b,
                renderFn: (val: number | null) =>
                    val != null
                        ? val.toLocaleString()
                        : <span className="text-forest-300">—</span>,
            },
            {
                label: "Pay Rates",
                icon: <DollarSign className="w-4 h-4" />,
                values: agencies.map((a) =>
                    a.pay_rates
                        ? Object.entries(a.pay_rates)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")
                        : null
                ),
                renderFn: (val: string | null) =>
                    val ? (
                        <span className="text-xs leading-relaxed">{val}</span>
                    ) : (
                        <span className="text-forest-300">—</span>
                    ),
            },
            {
                label: "Services",
                icon: <CheckCircle2 className="w-4 h-4" />,
                values: agencies.map((a) =>
                    a.services_offered?.length ? a.services_offered.join(", ") : null
                ),
                renderFn: (val: string | null) =>
                    val ? (
                        <span className="text-xs leading-relaxed">{val}</span>
                    ) : (
                        <span className="text-forest-300">—</span>
                    ),
            },
            {
                label: "Payers Accepted",
                icon: <ShieldCheck className="w-4 h-4" />,
                values: agencies.map((a) =>
                    a.payers_accepted?.length
                        ? a.payers_accepted.map((p) => p.replace("_", " ")).join(", ")
                        : null
                ),
                renderFn: (val: string | null) =>
                    val ? (
                        <span className="text-xs capitalize">{val}</span>
                    ) : (
                        <span className="text-forest-300">—</span>
                    ),
            },
            {
                label: "Languages",
                icon: <Globe className="w-4 h-4" />,
                values: agencies.map((a) =>
                    a.languages_spoken?.length
                        ? a.languages_spoken
                            .map((l) =>
                                l === "en" ? "English" : l === "ne" ? "Nepali" : l === "hi" ? "Hindi" : l
                            )
                            .join(", ")
                        : null
                ),
                renderFn: (val: string | null) =>
                    val || <span className="text-forest-300">—</span>,
            },
            {
                label: "Service Counties",
                icon: <MapPin className="w-4 h-4" />,
                values: agencies.map((a) =>
                    a.service_counties?.length ? a.service_counties.join(", ") : null
                ),
                renderFn: (val: string | null) =>
                    val ? (
                        <span className="text-xs">{val}</span>
                    ) : (
                        <span className="text-forest-300">—</span>
                    ),
            },
            {
                label: "Verified Partner",
                icon: <ShieldCheck className="w-4 h-4" />,
                values: agencies.map((a) => (a.is_verified_partner ? "Yes" : "No")),
                renderFn: (val: string) =>
                    val === "Yes" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified
                        </span>
                    ) : (
                        <span className="text-forest-400">Not verified</span>
                    ),
            },
            {
                label: "Benefits",
                icon: <CheckCircle2 className="w-4 h-4" />,
                values: agencies.map((a) =>
                    a.benefits?.length ? a.benefits.join(", ") : null
                ),
                renderFn: (val: string | null) =>
                    val ? (
                        <span className="text-xs leading-relaxed">{val}</span>
                    ) : (
                        <span className="text-forest-300">—</span>
                    ),
            },
            {
                label: "Website",
                icon: <Globe className="w-4 h-4" />,
                values: agencies.map((a) => a.website),
                renderFn: (val: string | null) =>
                    val ? (
                        <a
                            href={val}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-forest-600 underline hover:text-forest-800 text-xs truncate block max-w-[180px]"
                        >
                            {val.replace(/https?:\/\/(www\.)?/, "")}
                        </a>
                    ) : (
                        <span className="text-forest-300">—</span>
                    ),
            },
            {
                label: "Phone",
                icon: <Phone className="w-4 h-4" />,
                values: agencies.map((a) => a.phone),
                renderFn: (val: string | null) =>
                    val || <span className="text-forest-300">—</span>,
            },
        ];

    return (
        <div className="min-h-screen bg-cream">
            {/* Nav */}
            <nav className="bg-white border-b border-forest-100 px-4 py-3 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <Logo size="sm" />
                    <div className="flex items-center gap-3">
                        <Link
                            href="/agencies"
                            className="text-sm text-forest-600 hover:text-forest-800 transition-colors"
                        >
                            ← Back to directory
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                <div className="space-y-1">
                    <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
                        Compare agencies
                    </h1>
                    <p className="text-forest-500">
                        Side-by-side comparison of {agencies.map((a) => a.name).join(" vs ")}
                    </p>
                </div>

                {/* Agency header cards */}
                <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${agencies.length}, 1fr)` }}>
                    <div /> {/* Spacer for label column */}
                    {agencies.map((agency) => (
                        <div key={agency.id} className="bg-white rounded-xl border border-forest-100 p-4 text-center space-y-2">
                            <h2 className="font-fraunces text-lg font-semibold text-forest-800 leading-tight">
                                {agency.name}
                            </h2>
                            {agency.dba_name && (
                                <p className="text-xs text-forest-400">DBA: {agency.dba_name}</p>
                            )}
                            <p className="text-xs text-forest-500">
                                {agency.address_city}, {agency.address_state} {agency.address_zip}
                            </p>
                            {agency.is_verified_partner && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
                                    <ShieldCheck className="w-3 h-3" /> Verified Partner
                                </span>
                            )}
                            <div className="pt-2">
                                <Link
                                    href={`/switch/new?agency=${agency.id}`}
                                    className="inline-flex items-center justify-center gap-1 bg-forest-700 text-white text-xs font-medium rounded-lg px-4 py-2 hover:bg-forest-800 transition-colors w-full"
                                >
                                    Start switch — $97
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Comparison table */}
                <div className="bg-white rounded-xl border border-forest-100 overflow-hidden">
                    <table className="w-full">
                        <tbody>
                            {rows.map((row, i) => (
                                <tr
                                    key={row.label}
                                    className={i % 2 === 0 ? "bg-white" : "bg-forest-50/30"}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-forest-800 w-[200px] border-r border-forest-100">
                                        <div className="flex items-center gap-2">
                                            <span className="text-forest-400">{row.icon}</span>
                                            {row.label}
                                        </div>
                                    </td>
                                    <CompareCell
                                        values={row.values}
                                        compareFn={row.compareFn}
                                        renderFn={row.renderFn}
                                    />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* CTA */}
                <div className="bg-forest-50 rounded-xl p-6 text-center space-y-3">
                    <p className="text-forest-700 font-medium">
                        Ready to switch? Choose the agency that fits you best.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {agencies.map((agency) => (
                            <Link
                                key={agency.id}
                                href={`/switch/new?agency=${agency.id}`}
                                className="inline-flex items-center gap-2 bg-forest-700 text-white text-sm font-medium rounded-xl px-5 py-2.5 hover:bg-forest-800 transition-colors"
                            >
                                Switch to {agency.dba_name || agency.name} — $97
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
