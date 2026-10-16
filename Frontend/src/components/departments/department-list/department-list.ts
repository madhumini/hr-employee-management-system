import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

import {
  Department,
  DepartmentRequest
} from '../../../models/department.model';
import { DepartmentService } from '../../../services/department.service';

@Component({
  imports: [CommonModule,ReactiveFormsModule],
  selector: 'app-department-list',
  styleUrl: './department-list.scss',
  templateUrl: './department-list.html',
})
export class DepartmentList  implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly departmentService =
    inject(DepartmentService);

    departments = signal<Department[]>([]);
  // departments: Department[] = [];

  editingId: number | null = null;
  showForm = false;
  loading = false;
  searchText = '';

  departmentForm = this.fb.group({
    departmentCode: [
      '',
      [
        Validators.required,
        Validators.maxLength(20)
      ]
    ],
    departmentName: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],
    description: [
      '',
      Validators.maxLength(500)
    ]
  });

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;

    this.departmentService
      .getAll(this.searchText)
      .subscribe({
        next: data => {
          this.departments.set(data);
          // this.departments = data;
          this.loading = false;
        },
        error: error => {
          this.loading = false;
          this.showError(
            error,
            'Unable to load departments.'
          );
        }
      });
  }

  onSearch(value: string): void {
    this.searchText = value;
    this.loadDepartments();
  }

  openCreateForm(): void {
    this.editingId = null;

    this.departmentForm.reset({
      departmentCode: '',
      departmentName: '',
      description: ''
    });

    this.showForm = true;
  }

  openEditForm(department: Department): void {
    this.editingId = department.departmentId;

    this.departmentForm.patchValue({
      departmentCode: department.departmentCode,
      departmentName: department.departmentName,
      description: department.description ?? ''
    });

    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.departmentForm.reset();
  }

  saveDepartment(): void {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    const value = this.departmentForm.getRawValue();

    const request: DepartmentRequest = {
      departmentCode: value.departmentCode!.trim(),
      departmentName: value.departmentName!.trim(),
      description: value.description?.trim() || null
    };

    if (!request.departmentCode ||
        !request.departmentName) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const operation = this.editingId === null
      ? this.departmentService.create(request)
      : this.departmentService.update(
          this.editingId,
          request
        );

    operation.subscribe({
      next: () => {
        this.loading = false;
        this.showForm = false;
        this.editingId = null;

        void Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Department saved successfully.',
          timer: 1800,
          showConfirmButton: false
        });

        this.loadDepartments();
      },
      error: error => {
        this.loading = false;

        this.showError(
          error,
          'Unable to save department.'
        );
      }
    });
  }

  deactivateDepartment(
    department: Department
  ): void {
    void Swal.fire({
      icon: 'warning',
      title: 'Deactivate department?',
      text:
        `${department.departmentName} will become inactive.`,
      showCancelButton: true,
      confirmButtonText: 'Deactivate',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (!result.isConfirmed) {
        return;
      }

      this.departmentService
        .deactivate(department.departmentId)
        .subscribe({
          next: () => {
            void Swal.fire({
              icon: 'success',
              title: 'Deactivated',
              text: 'Department deactivated successfully.',
              timer: 1600,
              showConfirmButton: false
            });

            this.loadDepartments();
          },
          error: error => {
            this.showError(
              error,
              'Unable to deactivate department.'
            );
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