import Link from "next/link";

export const metadata = { title: "HIPAA Notice | SwitchMyCare" };

export default function HipaaPage() {
  return (
    <main className="min-h-screen bg-cream px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="text-sm text-forest-600 hover:text-forest-800">← Back home</Link>
        <h1 className="font-fraunces text-4xl font-semibold text-forest-800">HIPAA Notice</h1>
        <p className="text-forest-600">SwitchMyCare is designed to support secure handling of protected health information related to your switch request.</p>
        <p className="text-forest-700">Use of this platform may involve sharing health-related details with participating agencies as needed to fulfill your request.</p>
      </div>
    </main>
  );
}
