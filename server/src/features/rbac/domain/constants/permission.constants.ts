export const PERMISSION_ACTIONS = {
  // Note: CREATE, UPDATE, ARCHIVE, RESTORE deprecated - permissions are statically defined and managed via seeders only
  // Kept for backward compatibility with activity logs
  CREATE: 'CREATE_PERMISSION',
  UPDATE: 'UPDATE_PERMISSION',
  ARCHIVE: 'ARCHIVE_PERMISSION',
  RESTORE: 'RESTORE_PERMISSION',
  PAGINATED_LIST: 'PAGINATED_LIST_PERMISSION',
  BY_NAME: 'BY_NAME_PERMISSION',
  BY_RESOURCE_ACTION: 'BY_RESOURCE_ACTION_PERMISSION',
  // Note: COMBOBOX removed - not used in web app
} as const;
