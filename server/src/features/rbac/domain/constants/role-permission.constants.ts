export const ROLE_PERMISSION_ACTIONS = {
  CREATE: 'CREATE_ROLE_PERMISSION',
  // Note: ASSIGN_TO_ROLE removed - role-permission assignments are managed via seeders only
  FIND_BY_ROLE_ID: 'FIND_PERMISSION_IDS_BY_ROLE_ID',
  FIND_BY_ROLE: 'FIND_ROLE_PERMISSIONS_BY_ROLE_ID',
} as const;
