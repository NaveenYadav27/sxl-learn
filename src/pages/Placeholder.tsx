import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function Placeholder({ title, breadcrumb = [{ label: title }] as any }: { title: string; breadcrumb?: any }) {
  return (
    <AppLayout title={title} breadcrumb={<Breadcrumb items={breadcrumb} />}>
      <div className="container py-12">
        <Card>
          <CardContent className="pt-12 text-center">
            <Construction className="h-12 w-12 mx-auto text-primary/50 mb-4" />
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              This area is part of Phase 2/3 of the Enterprise Twin roadmap. Phase 1 ships the foundation, the catalog, and the reference Entra MFA + Conditional Access lab end-to-end.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
