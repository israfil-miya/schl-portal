import type { PermissionValue } from '../permissions';

export interface UserSession {
  db_id: string;
  db_role_id: string;
  permissions: PermissionValue[];
  real_name: string;
  e_id: string;
}

export type SharedUserSession = UserSession;
