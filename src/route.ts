// Central definition of application routes and the permissions required to view / access them.
// Sourced from the logic found in `components/Header/Nav.tsx` (kept in sync manually).

export interface AuthorizedRoute {
  href: string; // URL path (no trailing slash unless root)
  label: string; // Human readable label
  permissions: string[]; // Permissions ANY of which allow access (logical OR)
  children?: AuthorizedRoute[]; // Nested routes (dropdown items / sub-menus)
  notes?: string; // Optional notes / rationale
}

// Helper: check if a user permission set authorizes a route (OR semantics across route.permissions)
export function isRouteAuthorized(
  route: AuthorizedRoute,
  userPermissions: string[] | undefined | null,
): boolean {
  if (!route.permissions.length) return true; // public / inherited
  if (!userPermissions) return false;
  return route.permissions.some(p => userPermissions.includes(p));
}

// Top-level (navigation bar) authorized routes. Some entries (like Admin / Accountancy / CRM) act
// as menu containers and have children.
export const authorizedRoutes: AuthorizedRoute[] = [
  // Root tasks page
  { href: '/', label: 'Tasks', permissions: ['task:view_page'] },

  // Browse
  {
    href: '/browse',
    label: 'Browse',
    permissions: ['browse:view_page'],
  },

  // Single Task
  {
    href: '/browse/single-task',
    label: 'Edit Single Task',
    permissions: ['browse:edit_task'],
  },

  // Admin (with nested pages)
  {
    href: '/admin',
    label: 'Admin',
    permissions: ['admin:view_page'],
    children: [
      {
        href: '/admin/employees',
        label: 'Employees',
        permissions: ['admin:create_employee'],
      },
      {
        href: '/admin/tasks',
        label: 'Tasks',
        permissions: ['admin:create_task'],
      },
      {
        href: '/admin/clients',
        label: 'Clients',
        permissions: ['admin:manage_client', 'admin:create_client'],
      },
      {
        href: '/admin/approvals',
        label: 'Approvals',
        permissions: ['admin:check_approvals'],
      },
      {
        href: '/admin/users',
        label: 'Users',
        permissions: [
          'admin:edit_user',
          'admin:delete_user_approval',
          'admin:assign_role',
        ],
      },
      {
        href: '/admin/roles',
        label: 'Roles',
        permissions: ['admin:create_role', 'admin:delete_role'],
      },
      {
        href: '/admin/notices/create-notice',
        label: 'Create Notice',
        permissions: [
          'notice:send_notice_production',
          'notice:send_notice_marketers',
        ],
      },
      {
        href: '/admin/notices',
        label: 'Notices',
        permissions: [
          'notice:view_notice',
          'notice:send_notice_production',
          'notice:send_notice_marketers',
        ],
      },
    ],
  },

  // Accountancy
  {
    href: '/accountancy',
    label: 'Accountancy',
    permissions: ['accountancy:view_page'],
    children: [
      {
        href: '/accountancy/employees',
        label: 'Employees',
        permissions: ['accountancy:manage_employee'],
      },
      {
        href: '/accountancy/employees/employee-profile',
        label: 'Employee Profile',
        permissions: ['accountancy:manage_employee'],
      },
      {
        href: '/accountancy/invoices/create-invoice',
        label: 'Create Invoice',
        permissions: ['accountancy:create_invoice'],
      },
      {
        href: '/accountancy/invoices',
        label: 'Invoices',
        permissions: ['accountancy:download_invoice'],
      },
      {
        href: '/accountancy/invoices/invoice-tracker',
        label: 'Invoice Tracker',
        permissions: ['accountancy:create_invoice'],
      },
    ],
  },

  // CRM
  {
    href: '/crm',
    label: 'CRM',
    permissions: ['crm:view_reports', 'crm:check_client_request'],
    children: [
      {
        href: '/crm/statistics',
        label: 'Statistics',
        permissions: ['crm:view_crm_stats'],
      },
      {
        href: '/crm/trial-clients',
        label: 'Trial Clients',
        permissions: ['crm:view_reports'],
      },
      {
        href: '/crm/pending-prospects',
        label: 'Pending Prospects',
        permissions: ['crm:view_reports'],
      },
      {
        href: '/crm/potential-leads',
        label: 'Potential Leads',
        permissions: ['crm:view_reports'],
      },
      {
        href: '/crm/client-approvals',
        label: 'Client Approvals',
        permissions: ['crm:check_client_request'],
      },
    ],
  },

  // File Flow
  {
    href: '/file-flow',
    label: 'File Flow',
    permissions: ['fileflow:view_page'],
  },

  // Work Schedule
  {
    href: '/work-schedule',
    label: 'Work Schedule',
    permissions: ['schedule:view_page'],
    children: [
      {
        href: '/work-schedule/schedule-task',
        label: 'Schedule Task',
        permissions: ['schedule:create_schedule'],
      },
      {
        href: '/work-schedule/view-schedule',
        label: 'View Schedule',
        permissions: ['schedule:view_page'],
      },
    ],
  },

  // Account Settings
  {
    href: '/my-account',
    label: 'My Account',
    permissions: ['settings:view_page'],
    children: [
      {
        href: '/my-account/change-password',
        label: 'Change Password',
        permissions: ['settings:change_password'],
      },
    ],
  },
];

// Optional: flatten all leaf routes (if needed for quick lookups)
// export const flatAuthorizedRoutes: AuthorizedRoute[] = (() => {
//   const out: AuthorizedRoute[] = [];
//   const walk = (rts: AuthorizedRoute[]) => {
//     for (const r of rts) {
//       if (r.children && r.children.length) {
//         walk(r.children);
//       } else {
//         out.push(r);
//       }
//     }
//   };
//   walk(authorizedRoutes);
//   return out;
// })();

// Flat list that includes container routes (menus) as well as leaves.
// Cached once at module evaluation.
export const allAuthorizedRoutes: AuthorizedRoute[] = (() => {
  const out: AuthorizedRoute[] = [];
  const walk = (r: AuthorizedRoute) => {
    out.push({ ...r, children: undefined });
    r.children?.forEach(walk);
  };
  authorizedRoutes.forEach(walk);
  return out;
})();

export default authorizedRoutes;
