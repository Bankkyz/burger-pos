import type { Metadata } from "next";
import { LoginCard } from "@/features/auth/components/LoginCard";

export const metadata: Metadata = {
  title: "Sign In · Burger POS",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[var(--color-bg)] p-6">
      <LoginCard />
    </main>
  );
}
