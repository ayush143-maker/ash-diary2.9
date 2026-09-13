import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { CloudScreen } from "@/features/cloud/CloudScreen";

export const metadata: Metadata = { title: "Cloud Backup" };

export default function CloudPage() {
  return (
    <div className="pt-10">
      <PageHeader
        title="Cloud Backup"
        subtitle="Keep a backup of selected memories."
      />
      <div className="px-5">
        <CloudScreen />
      </div>
    </div>
  );
}
