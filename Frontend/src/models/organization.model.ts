export interface Organization {
  organizationId: number;
  organizationCode: string;
  organizationName: string;
  registrationNumber: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface OrganizationRequest {
  organizationCode: string;
  organizationName: string;
  registrationNumber: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}