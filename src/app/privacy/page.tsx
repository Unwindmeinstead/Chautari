import Link from "next/link";

export const metadata = { title: "Privacy Policy | SwitchMyCare" };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-cream px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="text-sm text-forest-600 hover:text-forest-800">← Back home</Link>
        <h1 className="font-fraunces text-4xl font-semibold text-forest-800">Privacy Policy</h1>
        <p className="text-forest-600">We only collect information needed to operate SwitchMyCare and support your care-switch workflow.</p>
        <section className="space-y-2 text-forest-700">
          <h2 className="font-semibold text-forest-800">What we collect</h2>
          <p>Account information, onboarding preferences, and request-related documents/messages you submit in the app.</p>
        </section>
        <section className="space-y-2 text-forest-700">
          <h2 className="font-semibold text-forest-800">How we use it</h2>
          <p>To match you with agencies, process switch requests, and communicate updates securely.</p>
        </section>
      </div>
    </main>
  );
}
