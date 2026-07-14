import { COLLECTIONS } from "@/constants";
import { createCrudService } from "@/services/firestoreCrud";
import type { Supplier } from "@/types";

export const suppliersService = createCrudService<Supplier>(COLLECTIONS.SUPPLIERS);
