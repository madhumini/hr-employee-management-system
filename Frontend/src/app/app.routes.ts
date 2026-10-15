import { Routes } from '@angular/router';
import { EmployeeList } from '../components/employees/employee-list/employee-list';
import { DepartmentList } from '../components/departments/department-list/department-list';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'employees',
    pathMatch: 'full'
  },
  {
    path: 'employees',
    component: EmployeeList
  },
  {
    path: 'departments',
    component: DepartmentList
  },
  {
    path: '**',
    redirectTo: 'employees'
  }
];
