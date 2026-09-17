export const ROLES = {
  ADMIN: "ADMIN",
  STAFF: "STAFF",
};

export const isAdmin = (user) => user?.role === ROLES.ADMIN;
export const isStaff = (user) => user?.role === ROLES.STAFF;

export const canManageUsers = (user) => isAdmin(user);
export const canAdjustStock = (user) => isAdmin(user);
export const canManageMasterData = (user) => isAdmin(user);

export default {
  ROLES,
  isAdmin,
  isStaff,
  canManageUsers,
  canAdjustStock,
  canManageMasterData,
};
