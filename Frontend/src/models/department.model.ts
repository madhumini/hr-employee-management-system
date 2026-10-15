export interface Department {
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface DepartmentRequest {
  departmentCode: string;
  departmentName: string;
  description: string | null;
}