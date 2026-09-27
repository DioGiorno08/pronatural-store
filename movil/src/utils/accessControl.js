const ADMINISTRATIVE_ROLES = new Set(["Admin", "Employee"]);

export const isAdministrativeUser = (user) =>
  ADMINISTRATIVE_ROLES.has(user?.role || user?.userType);
