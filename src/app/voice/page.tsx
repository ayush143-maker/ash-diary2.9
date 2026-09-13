import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { VoiceScreen } from "@/features/voice/VoiceScreen";

export const metadata: Metadata = { title: "Voice Memories" };

export default function VoicePage() {
  return (
    <div className="pt-10">
      <PageHeader
        title="Voice Memories"
        subtitle="The days, in your own voice."
      />
      <div className="px-5">
        <VoiceScreen />
      </div>
    </div>
  );
}
