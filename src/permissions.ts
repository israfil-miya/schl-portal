export const permissionOptions = [
  {
    label: 'Login',
    options: [
      { value: 'login:portal', label: 'Login at portal' },
      { value: 'login:crm', label: 'Login at crm' },
    ],
  },

  {
    label: 'Task',
    options: [
      { value: 'task:view_page', label: 'View task page' },
      { value: 'task:running_tasks', label: 'View running tasks' },
      {
        value: 'task:test_and_correction_tasks',
        label: 'View test and correction tasks',
      },
    ],
  },

  {
    label: 'Browse',
    options: [
      { value: 'browse:view_page', label: 'View browse page' },
      { value: 'browse:client_name', label: 'View client name' },
      { value: 'browse:edit_task', label: 'Edit task' },
      {
        value: 'browse:edit_task_approval',
        label: 'Edit task (approval)',
      },
      { value: 'browse:delete_task', label: 'Delete task' },
      {
        value: 'browse:delete_task_approval',
        label: 'Delet task (approval)',
      },
    ],
  },

  {
    label: 'FileFlow',
    options: [{ value: 'fileflow:view_page', label: 'View fileflow page' }],
  },

  {
    label: 'Notice',
    options: [
      { value: 'notice:view_notice', label: 'View notice page' },
      {
        value: 'notice:send_notice_production',
        label: 'Send notice to production',
      },
      {
        value: 'notice:send_notice_marketers',
        label: 'Send notice to marketers',
      },
    ],
  },

  {
    label: 'CRM',
    options: [
      // marketers
      { value: 'crm:create_report', label: 'Create report' },
      {
        value: 'crm:delete_report_approval',
        label: 'Delete report (approval)',
      },
      { value: 'crm:send_client_request', label: 'Send client request' },
      // admins
      { value: 'crm:view_reports', label: 'View reports (admin)' },
      { value: 'crm:view_crm_stats', label: 'View crm stats (admin)' },
      {
        value: 'crm:check_client_request',
        label: 'Check client request (admin)',
      },
    ],
  },

  {
    label: 'Accountancy',
    options: [
      { value: 'accountancy:view_page', label: 'View accountancy page' },
      { value: 'accountancy:create_invoice', label: 'Create invoice' },
      { value: 'accountancy:download_invoice', label: 'Download invoice' },
      { value: 'accountancy:delete_invoice', label: 'Delete invoice' },
      { value: 'accountancy:manage_employee', label: 'Manage employee' },
    ],
  },
  {
    label: 'Admin',
    options: [
      { value: 'admin:view_page', label: 'View admin page' },
      { value: 'admin:create_employee', label: 'Create employee' },
      { value: 'admin:create_task', label: 'Create task' },
      { value: 'admin:create_client', label: 'Create client' },
      { value: 'admin:manage_client', label: 'Manage client' },
      { value: 'admin:check_approvals', label: 'Check approvals' },
      { value: 'admin:create_role', label: 'Create role' },
      { value: 'admin:delete_role', label: 'Delete role' },
      { value: 'admin:assign_role', label: 'Assign role' },
      { value: 'admin:create_user', label: 'Create user' },
      { value: 'admin:create_user_approval', label: 'Create user (approval)' },
      { value: 'admin:edit_user', label: 'Edit user' },
      {
        value: 'admin:delete_user_approval',
        label: 'Delete user (approval)',
      },
    ],
  },

  {
    label: 'Schedule',
    options: [
      { value: 'schedule:view_page', label: 'View schedule page' },
      { value: 'schedule:create_schedule', label: 'Create schedule' },
      { value: 'schedule:edit_schedule', label: 'Edit schedule' },
      { value: 'schedule:delete_schedule', label: 'Delete schedule' },
    ],
  },

  {
    label: 'Settings',
    options: [
      { value: 'settings:view_page', label: 'View settings page' },
      // { value: 'settings:edit_profile', label: 'Edit profile' },
      { value: 'settings:change_password', label: 'Change password' },
      {
        value: 'settings:bypass_ip_restrictions',
        label: 'Bypass IP Restrictions',
      },
    ],
  },
] as const;
