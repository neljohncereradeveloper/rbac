import { PageHeader, PageShell, PageTitle } from "@/components/layout"

export default function RbacPage() {
  return (
    <>
      <PageHeader items={[{ label: "RBAC" }]} />
      <PageShell>
        <PageTitle
          title="RBAC"
          description="Role-Based Access Control. Manage roles, permissions, and users."
        />
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="bg-muted/50 aspect-video rounded-xl" />
          <div className="bg-muted/50 aspect-video rounded-xl" />
          <div className="bg-muted/50 aspect-video rounded-xl" />
        </div>
        <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min" />
      </PageShell>
    </>
  )
}
