// Re-export types from @/types/staff for compatibility
export type { StaffMember, User, TimeLog, AbsenceRequest } from '@/types/staff';

import type { StaffMember, AbsenceRequest } from '@/types/staff';


// Mock data for compatibility with existing components
// TODO: Remove when all components use real Convex data
export const mockStaffMembers: StaffMember[] = [];
export const mockAbsenceRequests: AbsenceRequest[] = [];
