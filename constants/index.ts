/** Firestore collection names — single source of truth to avoid typos across services. */
export const COLLECTIONS = {
  USERS: "users",
  INGREDIENTS: "ingredients",
  RECIPES: "recipes",
  RECIPE_ITEMS: "recipeItems",
  SALES: "sales",
  SALE_ITEMS: "saleItems",
  EXPENSES: "expenses",
  PURCHASES: "purchases",
  PURCHASE_ITEMS: "purchaseItems",
  SUPPLIERS: "suppliers",
  SETTINGS: "settings",
  LOGS: "logs",
} as const;

/** Only this email is permitted to access the system. Mirrored in firestore.rules. */
export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

export const DEFAULT_CURRENCY = "THB";

export const INGREDIENT_UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "pcs",
  "pack",
] as const;

export const INGREDIENT_CATEGORIES = [
  "Meat",
  "Produce",
  "Dairy",
  "Bakery",
  "Sauce & Condiment",
  "Beverage",
  "Packaging",
  "Other",
] as const;

export const EXPENSE_CATEGORIES = [
  "Gas",
  "Electricity",
  "Rent",
  "Salary",
  "Packaging",
  "Advertising",
  "Misc",
] as const;

export const PAYMENT_METHODS = ["Cash", "PromptPay", "Transfer"] as const;

export const SALE_CHANNELS = [
  "Walk-in",
  "Grab",
  "LINE MAN",
  "Foodpanda",
] as const;

export const ORDER_STATUS = ["open", "completed", "voided"] as const;

export const STOCK_MOVEMENT_TYPES = ["purchase", "sale", "adjustment"] as const;

/** Stock is "low" when currentStock <= minimumStock but still > 0. */
export const LOW_STOCK_THRESHOLD_RATIO = 1;
