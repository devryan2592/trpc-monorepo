import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar";
import DashboardSidebar from "@/components/sidebar";
import React from "react";
import DashboardHeader from "@/components/common/dashboard-header";
import DashboardPageLayout from "@/components/common/dashboard-page-layout";

interface DashboardLayoutLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayoutLayout({
  children,
}: DashboardLayoutLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="relative overflow-hidden">
        <DashboardHeader />
        <DashboardPageLayout>{children}</DashboardPageLayout>
      </SidebarInset>
    </SidebarProvider>
  );
}
