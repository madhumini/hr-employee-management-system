import { CommonModule } from '@angular/common';
import { Component, OnInit, inject,signal  } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

import { Employee, EmployeeRequest } from '../../../models/employee.model';
import { EmployeeService } from '../../../services/employee.service';
import { Observable, of } from 'rxjs';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-employee-list',
  styleUrl: './employee-list.scss',
  templateUrl: './employee-list.html',
})
export class EmployeeList  implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);

  employees = signal<Employee[]>([]);
  // employees: Employee[] = [];
  // employees$: Observable<Employee[]> = of([]);
  editingId: number | null = null;
  showForm = false;
  loading = false;
  searchText = '';

  employeeForm = this.fb.group({
    employeeCode: ['', [
      Validators.required,
      Validators.maxLength(20)
    ]],
    firstName: ['', [
      Validators.required,
      Validators.maxLength(50)
    ]],
    lastName: ['', [
      Validators.required,
      Validators.maxLength(50)
    ]],
    email: ['', [
      Validators.required,
      Validators.email,
      Validators.maxLength(150)
    ]],
    phone: [''],
    dateOfBirth: [''],
    gender: [''],
    hireDate: ['', Validators.required],
    jobTitle: ['', [
      Validators.required,
      Validators.maxLength(100)
    ]],
    department: ['', [
      Validators.required,
      Validators.maxLength(100)
    ]],
    salary: [0, [
      Validators.required,
      Validators.min(0)
    ]]
  });

  ngOnInit(): void {
    this.loadEmployees();
  }

// async loadEmployees(): Promise<void> {
//   this.loading = true;

//   try {
//     const data = await firstValueFrom(
//       this.employeeService.getAll(this.searchText)
//     );
// console.log('Employees loaded:', data);
//     this.employees = data;
//   } catch (error) {
//     this.showError(
//       error as HttpErrorResponse,
//       'Unable to load employees.'
//     );
//   } finally {
//     this.loading = false;
//   }
// }

  loadEmployees(): void {
    this.loading = true;

    this.employeeService.getAll(this.searchText).subscribe({
      next: data => {
        this.employees.set(data);
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        this.showError(error, 'Unable to load employees.');
      }
    });
  }

  // loadEmployees(): void {
  //   this.loading = true;

  //   this.employeeService.getAll(this.searchText).subscribe({
  //     next: data => {
  //       this.loading = false;
  //       this.employees$ = of(data);
  //     },
  //     error: error => {
  //       this.loading = false;
  //       this.showError(error, 'Unable to load employees.');
  //     }
  //   });
  // }

//   loadEmployees(): void {
//     this.loading = true;
//   this.employees$ = this.employeeService.getAll(this.searchText);
//   this.loading = false;
// }
//  async loadEmployees() {
//  await this.employeeService.getAll(this.searchText).subscribe({
//       next: data => {
//         this.loading = false;
//         if (data != null){
//         this.employees = data;}
//       },
//       error: error => {
//         this.loading = false;
//         this.showError(error, 'Unable to load employees.');
//       }
//     });
// }

  onSearch(value: string): void {
    this.searchText = value;
    this.loadEmployees();
  }

  openCreateForm(): void {
    this.editingId = null;
    this.employeeForm.reset({
      employeeCode: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      hireDate: '',
      jobTitle: '',
      department: '',
      salary: 0
    });

    this.showForm = true;
  }

  openEditForm(employee: Employee): void {
    this.editingId = employee.employeeId;

    this.employeeForm.patchValue({
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone ?? '',
      dateOfBirth: employee.dateOfBirth?.substring(0, 10) ?? '',
      gender: employee.gender ?? '',
      hireDate: employee.hireDate.substring(0, 10),
      jobTitle: employee.jobTitle,
      department: employee.department,
      salary: employee.salary
    });

    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.employeeForm.reset();
  }

  saveEmployee(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const value = this.employeeForm.getRawValue();

    const request: EmployeeRequest = {
      employeeCode: value.employeeCode!.trim(),
      firstName: value.firstName!.trim(),
      lastName: value.lastName!.trim(),
      email: value.email!.trim(),
      phone: value.phone?.trim() || null,
      dateOfBirth: value.dateOfBirth || null,
      gender: value.gender || null,
      hireDate: value.hireDate!,
      jobTitle: value.jobTitle!.trim(),
      department: value.department!.trim(),
      salary: Number(value.salary)
    };

    this.loading = true;

    const operation = this.editingId === null
      ? this.employeeService.create(request)
      : this.employeeService.update(this.editingId, request);

    operation.subscribe({
      next: () => {
        this.loading = false;
        this.showForm = false;
        this.editingId = null;

        void Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Employee saved successfully.',
          timer: 1800,
          showConfirmButton: false
        });

        this.loadEmployees();
      },
      error: error => {
        this.loading = false;
        this.showError(error, 'Unable to save employee.');
      }
    });
  }

  deactivateEmployee(employee: Employee): void {
    void Swal.fire({
      icon: 'warning',
      title: 'Deactivate employee?',
      text: `${employee.firstName} ${employee.lastName} will become inactive.`,
      showCancelButton: true,
      confirmButtonText: 'Deactivate',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (!result.isConfirmed) {
        return;
      }

      this.employeeService.deactivate(employee.employeeId)
        .subscribe({
          next: () => {
            void Swal.fire({
              icon: 'success',
              title: 'Deactivated',
              text: 'Employee has been deactivated.',
              timer: 1600,
              showConfirmButton: false
            });

            this.loadEmployees();
          },
          error: error => {
            this.showError(error, 'Unable to deactivate employee.');
          }
        });
    });
  }

  private showError(
    error: HttpErrorResponse,
    fallback: string
  ): void {
    const message =
      error.error?.message ??
      error.error?.title ??
      fallback;

    void Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message
    });
  }
}