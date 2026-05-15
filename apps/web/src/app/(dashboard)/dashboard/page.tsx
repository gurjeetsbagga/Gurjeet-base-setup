import { AurynHomeDashboard } from "@/components/dashboard/auryn-home-dashboard";
import { mockDashboardHomeData } from "@/lib/dashboard/mock-data";

export default function DashboardPage() {
  return <AurynHomeDashboard data={mockDashboardHomeData} />;
}
