import { COLLECTIONS } from "@/constants";
import { createCrudService } from "@/services/firestoreCrud";
import type { Expense } from "@/types";

export const expensesService = createCrudService<Expense>(COLLECTIONS.EXPENSES);
