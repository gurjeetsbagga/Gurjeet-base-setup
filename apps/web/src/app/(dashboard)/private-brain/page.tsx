import { PrivateBrainView } from "@/components/private-brain/private-brain-view";
import { mockPrivateBrainData } from "@/lib/private-brain/mock-data";

export const metadata = {
  title: "Private Brain | Hey Auryn",
  description: "Your memory. Your truth. Your evolution.",
};

export default function PrivateBrainPage() {
  return <PrivateBrainView data={mockPrivateBrainData} />;
}
