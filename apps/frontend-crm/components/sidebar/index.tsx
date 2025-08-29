"use client";

import { Sidebar, SidebarContent } from "@workspace/ui/components/sidebar";
import Header from "./sidebar-header";
import SidebarNav from "./sidebar-nav";

export function DahboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="sidebar" collapsible="icon" side="left" {...props}>
      <Header />
      <SidebarContent>
        <SidebarNav />
      </SidebarContent>
    </Sidebar>
  );
}

export default DahboardSidebar;
