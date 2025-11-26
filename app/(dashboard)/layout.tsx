import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

// Force dynamic rendering for all dashboard pages
// This prevents Next.js from trying to statically generate pages during build
// which would fail because pages use useSearchParams and database calls
export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Fixed */}
      <Sidebar />

      {/* Main Content - Scrollable */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
