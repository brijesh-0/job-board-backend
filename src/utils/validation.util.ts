import { ApplicationStatus } from "../types";

export const isValidStatusTransition = (
  currentStatus: ApplicationStatus,
  newStatus: ApplicationStatus,
): boolean => {
  const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
    Applied: ["Screening", "Rejected"],
    Screening: ["Interview", "Rejected"],
    Interview: ["Offer", "Rejected"],
    Offer: ["Rejected"],
    Rejected: [], // Cannot transition from rejected
  };

  return transitions[currentStatus]?.includes(newStatus) || false;
};

export const isValidSalaryRange = (min: number, max: number): boolean => {
  return min > 0 && max > 0 && min <= max;
};
