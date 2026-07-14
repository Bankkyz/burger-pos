import type { Metadata } from "next";
import { SettingsContent } from "@/features/settings/components/SettingsContent";

export const metadata: Metadata = {
  title: "Settings · Burger POS",
};

export default function SettingsPage() {
  return <SettingsContent />;
}
