import type {
  EXPENSE_CATEGORIES,
  INGREDIENT_CATEGORIES,
  INGREDIENT_UNITS,
  ORDER_STATUS,
  PAYMENT_METHODS,
  SALE_CHANNELS,
  STOCK_MOVEMENT_TYPES,
} from "@/constants";

export type IngredientUnit = (typeof INGREDIENT_UNITS)[number];
export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type SaleChannel = (typeof SALE_CHANNELS)[number];
export type OrderStatus = (typeof ORDER_STATUS)[number];
export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number];

export interface BaseDoc {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppUser extends BaseDoc {
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: "admin";
}

export interface Supplier extends BaseDoc {
  name: string;
  phone?: string;
  address?: string;
  note?: string;
}

export interface Ingredient extends BaseDoc {
  name: string;
  category: IngredientCategory;
  unit: IngredientUnit;
  purchasePrice: number; // price per purchase unit
  purchaseUnitGrams: number; // grams (or ml) represented by one purchase unit, for cost/gram calc
  currentStock: number; // in `unit`
  minimumStock: number; // in `unit`
  expireDate?: string | null; // ISO date
  supplierId?: string | null;
  costPerGram: number; // auto-calculated: purchasePrice / purchaseUnitGrams
}

export interface RecipeItem {
  id: string;
  recipeId: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: IngredientUnit;
  cost: number; // auto-calculated line cost
}

export interface Recipe extends BaseDoc {
  name: string;
  category?: string;
  imageUrl?: string | null;
  // Line items live in the `recipeItems` collection, keyed by recipeId.
  cost: number; // sum of item costs, denormalized for fast reads
  sellingPrice: number;
  profit: number; // sellingPrice - cost
  margin: number; // profit / sellingPrice
  active: boolean;
}

export interface SaleItem {
  id: string;
  saleId: string;
  recipeId: string;
  recipeName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  lineTotal: number;
  lineCost: number;
  lineProfit: number;
  createdAt: number; // denormalized from the parent sale, enables date-range queries
}

export interface Sale extends BaseDoc {
  orderNumber: string;
  // Line items live in the `saleItems` collection, keyed by saleId.
  itemCount: number;
  subtotal: number;
  discount: number;
  serviceCharge: number;
  deliveryFee: number;
  total: number;
  totalCost: number;
  profit: number;
  paymentMethod: PaymentMethod;
  channel: SaleChannel;
  status: OrderStatus;
  note?: string;
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  createdAt: number; // denormalized from the parent purchase, enables date-range queries
}

export interface Purchase extends BaseDoc {
  supplierId: string;
  supplierName: string;
  // Line items live in the `purchaseItems` collection, keyed by purchaseId.
  itemCount: number;
  total: number;
  note?: string;
}

export interface Expense extends BaseDoc {
  category: ExpenseCategory;
  amount: number;
  description?: string;
  date: string; // ISO date
}

export interface StockMovement extends BaseDoc {
  ingredientId: string;
  ingredientName: string;
  type: StockMovementType;
  quantity: number; // positive = in, negative = out
  balanceAfter: number;
  refId?: string; // saleId / purchaseId
  note?: string;
}

export interface RestaurantSettings {
  name: string;
  logoUrl?: string | null;
  currency: string;
  taxPercent: number;
  deliveryGpPercent: Record<SaleChannel, number>;
  promptPayId?: string;
  updatedAt: number;
}

export interface LogEntry extends BaseDoc {
  actorEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
}
