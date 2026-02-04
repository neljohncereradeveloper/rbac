export const ROLE_ACTIONS = {
  // Note: CREATE, CREATE_WITH_PERMISSIONS, UPDATE, ARCHIVE, RESTORE, ASSIGN_PERMISSIONS deprecated
  // Roles are statically defined (Admin, Editor, Viewer) and managed via seeders only
  // These constants kept for backward compatibility with existing activity logs
  CREATE: 'CREATE_ROLE',
  CREATE_WITH_PERMISSIONS: 'CREATE_ROLE_WITH_PERMISSIONS',
  UPDATE: 'UPDATE_ROLE',
  ARCHIVE: 'ARCHIVE_ROLE',
  RESTORE: 'RESTORE_ROLE',
  ASSIGN_PERMISSIONS: 'ASSIGN_PERMISSIONS_TO_ROLE',
  // Active actions (read-only operations)
  PAGINATED_LIST: 'PAGINATED_LIST_ROLE',
  BY_NAME: 'BY_NAME_ROLE',
  // Note: COMBOBOX removed - not used in web app
} as const;
