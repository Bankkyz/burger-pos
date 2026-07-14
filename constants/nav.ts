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
import type { Translations } from "@/lib/i18n/en";

export interface NavItem {
  labelKey: keyof Translations["nav"];
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "sales", href: "/sales", icon: ShoppingCart },
  { labelKey: "recipes", href: "/recipes", icon: ChefHat },
  { labelKey: "ingredients", href: "/ingredients", icon: Boxes },
  { labelKey: "inventory", href: "/inventory", icon: Warehouse },
  { labelKey: "purchases", href: "/purchases", icon: Truck },
  { labelKey: "expenses", href: "/expenses", icon: Wallet },
  { labelKey: "reports", href: "/reports", icon: Receipt },
  { labelKey: "settings", href: "/settings", icon: Settings },
];
