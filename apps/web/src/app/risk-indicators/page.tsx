import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { RiskIndicatorsDashboard } from "@/components/risk-indicators-dashboard";

export const metadata: Metadata = {
  title: "مؤشرات المخاطر | MyToolkit",
  description: "لوحة قياس احترافية لسجل المخاطر ونسبة المخاطر المفتوحة وربطها بالمهام والتحديات.",
};

export default function RiskIndicatorsPage() {
  return (
    <main className="min-h-screen">
      <AppHeader />
      <RiskIndicatorsDashboard />
    </main>
  );
}
