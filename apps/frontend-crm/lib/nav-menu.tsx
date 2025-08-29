import {
  Home,
  Users,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  FileText,
  CreditCard,
  LucideIcon,
  Hotel,
  PlaneTakeoff,
} from "lucide-react";

type NavMenuItem = {
  title: string;
  url?: string;
  isActive?: boolean;
  icon?: LucideIcon;
  items?: NavMenuItem[];
};

type NavMenuGroup = {
  groupLabel?: string;
  items: NavMenuItem[];
};

export const getMenuList = (): NavMenuGroup[] => {
  return [
    {
      groupLabel: "Main",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          isActive: true,
          icon: Home,
        },
        {
          title: "CRM",
          icon: Users,
          items: [
            {
              title: "All Customers",
              url: "/customers",
            },
            {
              title: "Add Customer",
              url: "/customers/add",
            },
            {
              title: "Customer Groups",
              url: "/customers/groups",
            },
          ],
        },
        {
          title: "Tours",

          icon: Hotel,
          items: [
            {
              title: "Itineraries",
              url: "/tours/itineraries",
            },
            {
              title: "Destinations",
              url: "/tours/destinations",
            },
          ],
        },
        {
          title: "Products",
          icon: Package,
          items: [
            {
              title: "All Products",
              url: "/products",
            },
            {
              title: "Add Product",
              url: "/products/add",
            },
            {
              title: "Categories",
              url: "/products/categories",
            },
            {
              title: "Inventory",
              url: "/products/inventory",
            },
          ],
        },
      ],
    },
    {
      groupLabel: "Analytics",
      items: [
        {
          title: "Reports",
          icon: BarChart3,
          items: [
            {
              title: "Sales Report",
              url: "/reports/sales",
            },
            {
              title: "Customer Report",
              url: "/reports/customers",
            },
            {
              title: "Product Report",
              url: "/reports/products",
            },
          ],
        },
        {
          title: "Invoices",
          url: "/invoices",
          icon: FileText,
        },
        {
          title: "Payments",
          url: "/payments",
          icon: CreditCard,
        },
      ],
    },
    {
      groupLabel: "System",
      items: [
        {
          title: "Settings",
          icon: Settings,
          items: [
            {
              title: "General",
              url: "/settings/general",
            },
            {
              title: "Users",
              url: "/settings/users",
            },
            {
              title: "Permissions",
              url: "/settings/permissions",
            },
          ],
        },
      ],
    },
  ];
};

// Export types for use in other components
export type { NavMenuItem, NavMenuGroup };
