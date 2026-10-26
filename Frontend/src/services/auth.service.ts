import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  userId: number;
  employeeId: number | null;
  email: string;
  role: 'Employee' | 'HR';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'https://localhost:7018/api/auth';

  private readonly tokenKey = 'hr_auth_token';
  private readonly userKey = 'hr_auth_user';

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap((response) => {
          sessionStorage.setItem(this.tokenKey, response.token);

          sessionStorage.setItem(
            this.userKey,
            JSON.stringify({
              userId: response.userId,
              employeeId: response.employeeId,
              email: response.email,
              role: response.role,
              expiresAt: response.expiresAt
            })
          );
        })
      );
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  getUser(): LoginResponse | null {
    const user = sessionStorage.getItem(this.userKey);

    if (!user) {
      return null;
    }

    try {
      const parsed = JSON.parse(user) as LoginResponse;

      if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
        this.logout();
        return null;
      }

      return parsed;
    } catch {
      this.logout();
      return null;
    }
  }

  getRole(): string | null {
    return this.getUser()?.role ?? null;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null && this.getUser() !== null;
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
  }
}