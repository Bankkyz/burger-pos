"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "signed-out") router.replace("/login");
    if (status === "forbidden") router.replace("/forbidden");
  }, [status, router]);

  if (status !== "authenticated") return <FullPageSpinner />;

  return <>{children}</>;
}
