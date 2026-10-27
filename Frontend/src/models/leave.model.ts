export interface LeaveType {
  leaveTypeId: number;
  leaveTypeName: string;
  annualAllowance: number;
}

export interface LeaveBalance {
  leaveBalanceId: number;
  employeeId: number;
  leaveTypeId: number;
  leaveTypeName: string;
  leaveYear: number;
  allocatedDays: number;
  usedDays: number;
  remainingDays: number;
}

export interface LeaveRequest {
  leaveRequestId: number;
  employeeId: number;
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  leaveTypeId: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  reviewComment?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
}

export interface LeaveRequestCreate {
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveReview {
  decision: 'Approved' | 'Rejected';
  reviewComment: string | null;
}