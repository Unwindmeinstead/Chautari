import { cookies } from "next/headers";
import { getDashboardData } from "@/lib/dashboard-actions";
import { AdminPreviewBanner } from "@/components/admin/admin-preview-banner";
import { PatientDashboardClient } from "@/components/dashboard/patient-dashboard-client";

export const metadata = { title: "Dashboard | SwitchMyCare" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const cookieStore = await cookies();
  const viewAs = cookieStore.get("chautari_view_as")?.value;

  return (
    <>
      {viewAs && <AdminPreviewBanner viewingAs={viewAs} />}
      <PatientDashboardClient data={data} />
    </>
  );
}
