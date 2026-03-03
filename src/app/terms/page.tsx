import Link from "next/link";

export const metadata = { title: "Terms of Service | SwitchMyCare" };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-cream px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="text-sm text-forest-600 hover:text-forest-800">← Back home</Link>
        <h1 className="font-fraunces text-4xl font-semibold text-forest-800">Terms of Service</h1>
        <p className="text-forest-600">By using SwitchMyCare, you agree to use the platform for lawful personal or agency-care coordination purposes.</p>
        <ul className="list-disc pl-5 text-forest-700 space-y-1">
          <li>Provide truthful account and request information.</li>
          <li>Do not misuse messaging, documents, or payment flows.</li>
          <li>We may update these terms as the service evolves.</li>
        </ul>
      </div>
    </main>
  );
}
