import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  LeaveRequestCreate,
  LeaveReview
} from './leave.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://localhost:7018/api/leave';

  getTypes(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(`${this.apiUrl}/types`);
  }

  getMyBalances(year = new Date().getFullYear())
    : Observable<LeaveBalance[]> {
    const params = new HttpParams().set('year', year);

    return this.http.get<LeaveBalance[]>(
      `${this.apiUrl}/my-balances`,
      { params }
    );
  }

  getMyRequests(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(
      `${this.apiUrl}/my-requests`
    );
  }

  createRequest(request: LeaveRequestCreate)
    : Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(
      `${this.apiUrl}/requests`,
      request
    );
  }

  getAllRequests(status = ''): Observable<LeaveRequest[]> {
    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<LeaveRequest[]>(
      `${this.apiUrl}/requests`,
      { params }
    );
  }

  reviewRequest(id: number, request: LeaveReview)
    : Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/requests/${id}/review`,
      request
    );
  }

  cancelRequest(id: number): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/requests/${id}/cancel`,
      {}
    );
  }
}