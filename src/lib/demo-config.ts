export const DEMO_ADMIN = {
  id: 'central_admin',
  email: 'admin@smartcampus-griet.demo',
  password: 'GRIET@Demo2026!',
  displayName: 'Smart Campus Administrator',
} as const;

export const DEMO_STAFF = [
  {
    id: 'staff_electrical_demo',
    staffId: 'GRIET-STAFF-ELEC-001',
    name: 'Electrical Staff',
    departmentId: 'dept_electrical',
    departmentName: 'Electrical',
  },
  {
    id: 'staff_maintenance_demo',
    staffId: 'GRIET-STAFF-MAINT-001',
    name: 'Maintenance Staff',
    departmentId: 'dept_maintenance',
    departmentName: 'Maintenance / Plumbing',
  },
  {
    id: 'staff_it_demo',
    staffId: 'GRIET-STAFF-IT-001',
    name: 'IT / AV Staff',
    departmentId: 'dept_it',
    departmentName: 'IT / AV Support',
  },
  {
    id: 'staff_housekeeping_demo',
    staffId: 'GRIET-STAFF-HK-001',
    name: 'Housekeeping Staff',
    departmentId: 'dept_housekeeping',
    departmentName: 'Housekeeping',
  },
  {
    id: 'staff_furniture_demo',
    staffId: 'GRIET-STAFF-FURN-001',
    name: 'Furniture Staff',
    departmentId: 'dept_maintenance',
    departmentName: 'Furniture / Maintenance',
  },
  {
    id: 'staff_admin_demo',
    staffId: 'GRIET-STAFF-ADMIN-001',
    name: 'Administration Staff',
    departmentId: 'dept_admin',
    departmentName: 'Administration',
  },
] as const;
