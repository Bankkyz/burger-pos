import type { ReactNode } from "react";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteGuard } from "@/features/auth/components/RouteGuard";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RouteGuard>
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-4 pb-20 lg:p-6 lg:pb-6">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>
        <MobileNav />
      </div>
    </RouteGuard>
  );
}
