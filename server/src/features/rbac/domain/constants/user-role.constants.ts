export const USER_ROLE_ACTIONS = {
  CREATE: 'CREATE_USER_ROLE',
  ASSIGN_TO_USER: 'ASSIGN_ROLES_TO_USER',
  // Note: REMOVE_FROM_USER removed - not used in web app (assign with replace=true handles role removal)
  FIND_ROLE_IDS_BY_USER_ID: 'FIND_ROLE_IDS_BY_USER_ID',
  FIND_BY_USER_ID: 'FIND_USER_ROLES_BY_USER_ID',
  EXISTS: 'EXISTS_USER_ROLE',
} as const;
