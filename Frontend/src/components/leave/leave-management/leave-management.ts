import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { LeaveService } from '../../../services/leave.service';
import {
  LeaveBalance,
  LeaveRequest,
  LeaveType
} from '../../../models/leave.model';

@Component({
  selector: 'app-leave-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './leave-management.html',
  styleUrl: './leave-management.css'
})
export class LeaveManagement implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly leaveService = inject(LeaveService);
  private readonly authService = inject(AuthService);

  isHR = false;
  loading = false;
  submitting = false;

  leaveTypes: LeaveType[] = [];
  balances: LeaveBalance[] = [];
  myRequests: LeaveRequest[] = [];
  allRequests: LeaveRequest[] = [];

  statusFilter = 'Pending';

  leaveForm = this.fb.nonNullable.group({
    leaveTypeId: [0, [Validators.min(1)]],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    reason: ['', [Validators.required, Validators.maxLength(500)]]
  });

  ngOnInit(): void {
    this.isHR = this.authService.getRole() === 'HR';

    this.loadLeaveTypes();

    if (this.isHR) {
      this.loadAllRequests();
    } else {
      this.loadEmployeeData();
    }
  }

  loadLeaveTypes(): void {
    this.leaveService.getTypes().subscribe({
      next: data => this.leaveTypes = data,
      error: error => this.showError(error)
    });
  }

  loadEmployeeData(): void {
    this.loading = true;

    this.leaveService.getMyBalances().subscribe({
      next: data => this.balances = data,
      error: error => this.showError(error)
    });

    this.leaveService.getMyRequests().subscribe({
      next: data => {
        this.myRequests = data;
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        this.showError(error);
      }
    });
  }

  loadAllRequests(): void {
    this.loading = true;

    this.leaveService.getAllRequests(this.statusFilter).subscribe({
      next: data => {
        this.allRequests = data;
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        this.showError(error);
      }
    });
  }

  submitLeave(): void {
    if (this.leaveForm.invalid || this.submitting) {
      this.leaveForm.markAllAsTouched();
      return;
    }

    const value = this.leaveForm.getRawValue();

    if (value.endDate < value.startDate) {
      Swal.fire('Invalid dates', 'End date cannot be before start date.', 'warning');
      return;
    }

    this.submitting = true;

    this.leaveService.createRequest({
      leaveTypeId: value.leaveTypeId,
      startDate: value.startDate,
      endDate: value.endDate,
      reason: value.reason.trim()
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.leaveForm.reset({
          leaveTypeId: 0,
          startDate: '',
          endDate: '',
          reason: ''
        });

        Swal.fire(
          'Submitted',
          'Your leave request has been submitted.',
          'success'
        );

        this.loadEmployeeData();
      },
      error: error => {
        this.submitting = false;
        this.showError(error);
      }
    });
  }

  review(request: LeaveRequest, decision: 'Approved' | 'Rejected'): void {
    Swal.fire({
      title: `${decision} leave request?`,
      text: `${request.firstName ?? ''} ${request.lastName ?? ''}`,
      input: 'textarea',
      inputLabel: 'Review comment (optional)',
      inputPlaceholder: 'Enter a comment',
      showCancelButton: true,
      confirmButtonText: decision,
      inputValidator: value =>
        (value?.length ?? 0) > 500
          ? 'Comment cannot exceed 500 characters.'
          : undefined
    }).then(result => {
      if (!result.isConfirmed) {
        return;
      }

      this.leaveService.reviewRequest(request.leaveRequestId, {
        decision,
        reviewComment: result.value?.trim() || null
      }).subscribe({
        next: () => {
          Swal.fire('Updated', `Request ${decision.toLowerCase()}.`, 'success');
          this.loadAllRequests();
        },
        error: error => this.showError(error)
      });
    });
  }

  cancelRequest(request: LeaveRequest): void {
    Swal.fire({
      title: 'Cancel leave request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Cancel request'
    }).then(result => {
      if (!result.isConfirmed) {
        return;
      }

      this.leaveService.cancelRequest(request.leaveRequestId).subscribe({
        next: () => {
          Swal.fire('Cancelled', 'Leave request cancelled.', 'success');
          this.loadEmployeeData();
        },
        error: error => this.showError(error)
      });
    });
  }

  private showError(error: HttpErrorResponse): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.error?.message ??
        error.error?.detail ??
        'Something went wrong. Please try again.'
    });
  }
}