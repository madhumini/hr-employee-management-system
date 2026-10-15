import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Department,
  DepartmentRequest
} from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private readonly http = inject(HttpClient);

  // Use the same actual HTTPS port as your .NET API.
  private readonly apiUrl =
    'https://localhost:7244/api/departments';

  getAll(search = ''): Observable<Department[]> {
    let params = new HttpParams();

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<Department[]>(
      this.apiUrl,
      { params }
    );
  }

  getById(id: number): Observable<Department> {
    return this.http.get<Department>(
      `${this.apiUrl}/${id}`
    );
  }

  create(request: DepartmentRequest): Observable<Department> {
    return this.http.post<Department>(
      this.apiUrl,
      request
    );
  }

  update(
    id: number,
    request: DepartmentRequest
  ): Observable<Department> {
    return this.http.put<Department>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  deactivate(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}