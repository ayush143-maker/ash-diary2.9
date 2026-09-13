import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { JournalList } from "@/features/journal/JournalList";
import { Sprig } from "@/components/shared/Sprig";

export const metadata: Metadata = { title: "Your Journal" };

export default function JournalPage() {
  return (
    <div className="relative pt-10">
      <Sprig
        seed="journal-header"
        size={56}
        className="text-ok pointer-events-none absolute top-8 right-5"
      />
      <PageHeader
        title="Your Journal"
        subtitle="Every day you chose to keep."
      />
      <div className="px-5">
        <JournalList />
      </div>
    </div>
  );
}
