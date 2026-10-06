import { ErrorView } from "@/components/error-view";

// Served in place of every page when the MAINTENANCE flag is on at the edge.
export default function MaintenancePage() {
  return <ErrorView kind="maintenance" />;
}
