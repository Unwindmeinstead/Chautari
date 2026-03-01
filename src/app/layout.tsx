import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import { cookies } from "next/headers";
import "@/styles/globals.css";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { I18nProvider } from "@/lib/i18n-context";
import type { Lang } from "@/lib/i18n";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Chautari — Find Your Home Care",
    template: "%s | Chautari",
  },
  description:
    "Chautari helps Pennsylvania residents find and switch to the right home health and home care agency. Simple, guided, and free.",
  keywords: ["home health", "home care", "Pennsylvania", "Medicaid", "Medicare", "agency switch"],
  authors: [{ name: "Chautari" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://chautari.health"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chautari.health",
    title: "Chautari — Find Your Home Care",
    description: "Guided home care agency switching for Pennsylvania residents.",
    siteName: "Chautari",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A3D2B",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("chautari_lang")?.value;
  const initialLang = (["en", "ne", "hi"].includes(langCookie ?? "") ? langCookie : "en") as Lang;

  return (
    <html lang={initialLang} className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-cream font-sans antialiased">
        <I18nProvider initialLang={initialLang}>
          <ToastProvider>
            {children}
            <ToastViewport />
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
