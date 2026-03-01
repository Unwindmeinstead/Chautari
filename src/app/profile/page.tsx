import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard-actions";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { ProfileEditForm } from "@/components/dashboard/profile-edit-form";
import { Button } from "@/components/ui/button";
import { payerLabel, careTypeLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, ShieldCheck, Heart, Calendar, User, Phone, Languages,
  Edit3, Lock
} from "lucide-react";

export const metadata = { title: "My Profile | Chautari" };
export const dynamic = "force-dynamic";

const SERVICE_LABELS: Record<string, string> = {
  skilled_nursing: "Skilled Nursing", physical_therapy: "Physical Therapy",
  occupational_therapy: "Occupational Therapy", speech_therapy: "Speech Therapy",
  medical_social_work: "Medical Social Work", home_health_aide: "Home Health Aide",
  personal_care: "Personal Care", companion_care: "Companion Care",
  homemaker: "Homemaker", respite_care: "Respite Care",
  medication_reminders: "Medication Reminders", transportation: "Transportation",
  meal_preparation: "Meal Preparation",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const data = await getDashboardData();
  const d = data.patientDetails;

  return (
    <div className="min-h-screen bg-cream">
      <DashboardNav
        userName={data.profile?.full_name ?? null}
        unreadCount={data.unreadCount}
      />

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              Dashboard
            </Link>
          </Button>
        </div>

        <div className="space-y-1">
          <h1 className="font-fraunces text-3xl font-semibold text-forest-800">My Profile</h1>
          <p className="text-forest-500">Manage your personal and care information.</p>
        </div>

        {/* Editable fields */}
        <div className="rounded-2xl bg-white border border-forest-100 shadow-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Edit3 className="size-4 text-forest-500" />
            <h2 className="font-fraunces text-lg font-semibold text-forest-800">Personal Information</h2>
          </div>
          <ProfileEditForm
            initialData={{
              full_name: data.profile?.full_name ?? "",
              phone: data.profile?.phone ?? "",
              preferred_lang: data.profile?.preferred_lang ?? "en",
            }}
          />
        </div>

        {/* Read-only care info (editable via re-onboarding) */}
        {d && (
          <>
            {/* Address */}
            <div className="rounded-2xl bg-white border border-forest-100 shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-forest-500" />
                  <h2 className="font-fraunces text-lg font-semibold text-forest-800">Address</h2>
                </div>
                <div className="flex items-center gap-1 text-xs text-forest-400">
                  <Lock className="size-3" />
                  <span>To update, re-run onboarding</span>
                </div>
              </div>
              <div className="space-y-1 text-sm text-forest-700">
                {d.address_line1 && <p>{d.address_line1}</p>}
                <p>
                  {[d.address_city, d.address_state, d.address_zip].filter(Boolean).join(", ")}
                </p>
                {d.address_county && (
                  <p className="text-forest-400">{d.address_county} County</p>
                )}
              </div>
              <Button variant="ghost" size="sm" asChild className="text-forest-500 -ml-2">
                <Link href="/onboarding">Update address →</Link>
              </Button>
            </div>

            {/* Insurance */}
            <div className="rounded-2xl bg-white border border-forest-100 shadow-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-forest-500" />
                <h2 className="font-fraunces text-lg font-semibold text-forest-800">Insurance</h2>
              </div>
              {d.payer_type ? (
                <div className="flex items-center gap-2">
                  <Badge variant="info" className="text-sm px-3 py-1">{payerLabel(d.payer_type)}</Badge>
                </div>
              ) : (
                <p className="text-sm text-forest-400 italic">Not set</p>
              )}
              <Button variant="ghost" size="sm" asChild className="text-forest-500 -ml-2">
                <Link href="/onboarding">Update insurance →</Link>
              </Button>
            </div>

            {/* Care needs */}
            <div className="rounded-2xl bg-white border border-forest-100 shadow-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="size-4 text-forest-500" />
                <h2 className="font-fraunces text-lg font-semibold text-forest-800">Care Needs</h2>
              </div>
              {d.care_type && (
                <div>
                  <p className="text-xs text-forest-400 mb-1">Care type</p>
                  <Badge variant="default">{careTypeLabel(d.care_type)}</Badge>
                </div>
              )}
              {d.services_needed && d.services_needed.length > 0 && (
                <div>
                  <p className="text-xs text-forest-400 mb-2">Services needed</p>
                  <div className="flex flex-wrap gap-2">
                    {d.services_needed.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {SERVICE_LABELS[s] ?? s.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <Button variant="ghost" size="sm" asChild className="text-forest-500 -ml-2">
                <Link href="/onboarding">Update care needs →</Link>
              </Button>
            </div>
          </>
        )}

        {/* Account info (read-only) */}
        <div className="rounded-2xl bg-white border border-forest-100 shadow-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <User className="size-4 text-forest-500" />
            <h2 className="font-fraunces text-lg font-semibold text-forest-800">Account</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-forest-400">Email</span>
              <span className="text-forest-700 font-medium">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-forest-400">Role</span>
              <Badge variant="secondary" className="capitalize">{data.profile?.role ?? "patient"}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-forest-400">Member since</span>
              <span className="text-forest-700">
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  month: "long", year: "numeric"
                })}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-forest-100">
            <Button variant="ghost" size="sm" asChild className="text-forest-500 -ml-2">
              <Link href="/auth/reset-password">Change password →</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
