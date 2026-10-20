import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import Swal from 'sweetalert2';

import {
  Organization,
  OrganizationRequest
} from '../../../models/organization.model';
import { OrganizationService } from '../../../services/organization.service';

@Component({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-organization-list',
  styleUrl: './organization-list.scss',
  templateUrl: './organization-list.html',
})
export class OrganizationList implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly organizationService = inject(OrganizationService);
  organizations = signal<Organization[]>([]);

  // organizations: Organization[] = [];

  editingId: number | null = null;
  showForm = false;
  loading = signal(false);
  searchText = '';

  organizationForm = this.fb.nonNullable.group({
    organizationCode: ['', [
      Validators.required,
      Validators.maxLength(20)
    ]],
    organizationName: ['', [
      Validators.required,
      Validators.maxLength(150)
    ]],
    registrationNumber: ['', Validators.maxLength(50)],
    email: ['', [
      Validators.email,
      Validators.maxLength(150)
    ]],
    phone: ['', Validators.maxLength(30)],
    address: ['', Validators.maxLength(300)]
  });

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    this.loading.set(true);

    this.organizationService.getAll(this.searchText).subscribe({
      next: data => {
        this.organizations.set(data);
        // this.organizations = data;
        this.loading.set(false);
      },
      error: error => {
        this.loading.set(false);
        this.showError(error);
      }
    });
  }

  onSearch(): void {
    this.loadOrganizations();
  }

  openCreateForm(): void {
    this.editingId = null;
    this.organizationForm.reset();
    this.showForm = true;
  }

  openEditForm(organization: Organization): void {
    this.editingId = organization.organizationId;

    this.organizationForm.patchValue({
      organizationCode: organization.organizationCode,
      organizationName: organization.organizationName,
      registrationNumber: organization.registrationNumber ?? '',
      email: organization.email ?? '',
      phone: organization.phone ?? '',
      address: organization.address ?? ''
    });

    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.organizationForm.reset();
  }

  saveOrganization(): void {
    if (this.organizationForm.invalid) {
      this.organizationForm.markAllAsTouched();
      return;
    }

    const formValue = this.organizationForm.getRawValue();

    const request: OrganizationRequest = {
      organizationCode: formValue.organizationCode.trim(),
      organizationName: formValue.organizationName.trim(),
      registrationNumber: formValue.registrationNumber.trim() || null,
      email: formValue.email.trim() || null,
      phone: formValue.phone.trim() || null,
      address: formValue.address.trim() || null
    };

    if (!request.organizationCode || !request.organizationName) {
      return;
    }

    const isEditing = this.editingId !== null;

    const operation = isEditing
      ? this.organizationService.update(this.editingId!, request)
      : this.organizationService.create(request);

    operation.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: isEditing
            ? 'Organization updated successfully.'
            : 'Organization created successfully.'
        });

        this.cancelForm();
        this.loadOrganizations();
      },
      error: (error: HttpErrorResponse) => this.showError(error)
    });
  }

  deactivateOrganization(organization: Organization): void {
    Swal.fire({
      title: 'Deactivate organization?',
      text: `Deactivate ${organization.organizationName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, deactivate',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.organizationService
        .deactivate(organization.organizationId)
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deactivated',
              text: 'Organization deactivated successfully.'
            });

            this.loadOrganizations();
          },
          error: (error: HttpErrorResponse) => this.showError(error)
        });
    });
  }

  private showError(error: HttpErrorResponse): void {
    const message =
      error.error?.message ??
      error.error?.detail ??
      'An unexpected error occurred. Please try again.';

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message
    });
  }
}