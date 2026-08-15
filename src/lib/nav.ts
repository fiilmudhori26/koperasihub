import { Role, ROLE_PERMISSIONS } from "@/lib/types";

export type NavItem = { href: string; label: string; permission: string; icon: string };

// Single nav source. Sidebar filters by ROLE_PERMISSIONS.
export const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", permission: "dashboard", icon: "▦" },
  { href: "/products", label: "Products", permission: "products", icon: "▣" },
  { href: "/inventory", label: "Inventory", permission: "inventory", icon: "⇅" },
  { href: "/sales", label: "POS / Sales", permission: "sales", icon: "⊞" },
  { href: "/customers", label: "Customers", permission: "customers", icon: "☺" },
  { href: "/reports", label: "Reports", permission: "reports", icon: "◷" },
  { href: "/activity", label: "Activity", permission: "activity", icon: "❖" },
  { href: "/users", label: "Users", permission: "users", icon: "◉" },
  { href: "/settings", label: "Settings", permission: "settings", icon: "⚙" },
];

export function navForRole(role: Role): NavItem[] {
  return NAV.filter((n) => ROLE_PERMISSIONS[role]?.includes(n.permission));
}
