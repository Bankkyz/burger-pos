import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  ChefHat,
  LayoutDashboard,
  Receipt,
  Settings,
  ShoppingCart,
  Truck,
  Warehouse,
  Wallet,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Sales", href: "/sales", icon: ShoppingCart },
  { label: "Recipes", href: "/recipes", icon: ChefHat },
  { label: "Ingredients", href: "/ingredients", icon: Boxes },
  { label: "Inventory", href: "/inventory", icon: Warehouse },
  { label: "Purchases", href: "/purchases", icon: Truck },
  { label: "Expenses", href: "/expenses", icon: Wallet },
  { label: "Reports", href: "/reports", icon: Receipt },
  { label: "Settings", href: "/settings", icon: Settings },
];
