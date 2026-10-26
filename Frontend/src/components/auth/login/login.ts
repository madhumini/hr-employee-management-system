import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

import { AuthService } from '../../../services/auth.service';

@Component({
  imports: [CommonModule,ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (response) => {
        this.loading = false;

        if (response.role === 'HR') {
          void this.router.navigate(['/employees']);
        } else {
          void this.router.navigate(['/my-profile']);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Login failed',
          text: error.status === 401
            ? 'Invalid email or password.'
            : 'Unable to sign in. Please try again.'
        });
      }
    });
  }
}