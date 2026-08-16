import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppLayout>{children}</AppLayout>
      </div>
    </ProtectedRoute>
  );
}
