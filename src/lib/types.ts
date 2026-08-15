export const ROLES = ["ADMIN", "MANAGER", "CASHIER"] as const;
export type Role = (typeof ROLES)[number];

export const MOVEMENT_TYPES = ["IN", "OUT", "ADJUSTMENT", "RETURN"] as const;
export type MovementType = (typeof MOVEMENT_TYPES)[number];

export const PAYMENT_METHODS = ["CASH", "TRANSFER", "QRIS"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// What each role may access. Single source of truth for RBAC.
// ponytail: flat map, not a bitfield — only 3 roles, no need to generalize.
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  ADMIN: ["dashboard", "products", "inventory", "sales", "customers", "reports", "activity", "users", "settings"],
  MANAGER: ["dashboard", "products", "inventory", "sales", "reports", "activity"],
  CASHIER: ["sales", "customers", "activity"],
};

export function can(role: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function roleFrom(value: unknown): Role {
  return ROLES.includes(value as Role) ? (value as Role) : "CASHIER";
}
