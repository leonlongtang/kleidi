import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Πύλη Μητρώου (DEMO MOCK)",
  description: "Demo mock of a Greek tax-registry application. Not a government site.",
};

export default function MockAadeLayout({ children }: LayoutProps<"/mock-aade">) {
  return (
    <div lang="el" className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <div role="note" className="bg-yellow-300 px-4 py-2 text-center text-sm font-bold text-black">
        DEMO MOCK, not a government site · Δοκιμαστική απομίμηση, όχι κρατικός ιστότοπος
      </div>
      <header className="border-b-4 border-blue-900 bg-white px-6 py-4">
        <p className="text-lg font-semibold text-blue-900">Ψηφιακή Πύλη Μητρώου (δοκιμαστική)</p>
        <p className="text-sm text-gray-600">Απόδοση ΑΦΜ σε αλλοδαπούς φορολογικούς κατοίκους Ελλάδας</p>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
}
