import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { JournalPrefsSection } from "@/features/general/JournalPrefsSection";
import { PrivacySection } from "@/features/general/PrivacySection";
import { RemindersSection } from "@/features/general/RemindersSection";

export const metadata: Metadata = { title: "General" };

export default function GeneralPage() {
  return (
    <div className="pt-10">
      <PageHeader
        title="General"
        subtitle="How ASH DIARY looks and behaves."
      />
      <div className="px-5 pb-4">
        <JournalPrefsSection />
        <PrivacySection />
        <RemindersSection />
      </div>
    </div>
  );
}
