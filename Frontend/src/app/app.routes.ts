import { Routes } from '@angular/router';
import { EmployeeList } from '../components/employees/employee-list/employee-list';
import { DepartmentList } from '../components/departments/department-list/department-list';
import { OrganizationList } from '../components/organizations/organization-list/organization-list';
import { Login } from '../components/auth/login/login';
import { authGuard } from '../components/auth/auth.guard';

export const routes: Routes = [
    {
    path: 'login',
    component: Login
  },
  {
    path: 'employees',
    component: EmployeeList,
    canActivate: [authGuard],
    data: { roles: ['HR'] }
  },
  {
    path: 'departments',
    component: DepartmentList,
    canActivate: [authGuard],
    data: { roles: ['HR'] }
  },
  {
    path: 'organizations',
    component: OrganizationList,
    canActivate: [authGuard],
    data: { roles: ['HR'] }
  },
  // {
  //   path: 'my-profile',
  //   canActivate: [authGuard],
  //   data: { roles: ['Employee', 'HR'] },
  //   loadComponent: () =>
  //     import('./features/auth/my-profile')
  //       .then(m => m.MyProfileComponent)
  // },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
  // {
  //   path: '',
  //   redirectTo: 'employees',
  //   pathMatch: 'full'
  // },
  // {
  //   path: 'employees',
  //   component: EmployeeList
  // },
  // {
  //   path: 'departments',
  //   component: DepartmentList
  // },
  // {
  //   path: 'organizations',
  //   component: OrganizationList
  // },
  // {
  //   path: '**',
  //   redirectTo: 'employees'
  // }
];
