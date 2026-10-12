export interface Employee {
  employeeId: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  hireDate: string;
  jobTitle: string;
  department: string;
  salary: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface EmployeeRequest {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  hireDate: string;
  jobTitle: string;
  department: string;
  salary: number;
}