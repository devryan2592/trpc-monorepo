import { FC } from "react";
import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { getMenuList, NavMenuItem } from "@/lib/nav-menu";
import { ChevronRight } from "lucide-react";

interface SidebarNavProps {
  children?: React.ReactNode;
}

const SidebarNav: FC<SidebarNavProps> = ({ children }) => {
  const menuGroups = getMenuList();

  const renderMenuItem = (item: NavMenuItem) => {
    // If item has sub-items, render as collapsible
    if (item.items && item.items.length > 0) {
      return (
        <Collapsible key={item.title}>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="w-full">
                {item.icon && <item.icon className="mr-1 h-4 w-4" />}
                <span>{item.title}</span>
                <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton asChild>
                      <Link href={subItem.url || "#"}>
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    }

    // If item has no sub-items, render as direct link
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={item.isActive}>
          <Link href={item.url || "#"}>
            {item.icon && <item.icon className="mr-1 h-4 w-4" />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <>
      {menuGroups.map((group, index) => (
        <SidebarGroup key={group.groupLabel || `group-${index}`}>
          {group.groupLabel && (
            <SidebarGroupLabel>{group.groupLabel}</SidebarGroupLabel>
          )}
          <SidebarMenu>{group.items.map(renderMenuItem)}</SidebarMenu>
        </SidebarGroup>
      ))}
      {children}
    </>
  );
};

export default SidebarNav;
