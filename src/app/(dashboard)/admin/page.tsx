/**
 * Admin dashboard layout — placeholder for future admin portal.
 * Protected by ADMIN role in middleware.
 */
export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="tracking-tight">Admin dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Platform administration & configuration
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
        <p className="text-lg font-medium">Admin Dashboard</p>
        <p className="text-sm mt-1">Coming in Phase 5 — role-based admin panel</p>
      </div>
    </div>
  );
}
