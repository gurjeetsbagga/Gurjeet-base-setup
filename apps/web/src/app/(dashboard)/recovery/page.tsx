import { PhysicianOsRecoveryView } from "@/components/recovery/physicianos-recovery-view";
import { mockPhysicianOsRecoveryData } from "@/lib/recovery/mock-data";

export const metadata = {
  title: "Recovery | Hey Auryn",
  description: "ACL recovery protocol, healing timeline, and wellness metrics.",
};

export default function RecoveryPage() {
  return <PhysicianOsRecoveryView data={mockPhysicianOsRecoveryData} />;
}
