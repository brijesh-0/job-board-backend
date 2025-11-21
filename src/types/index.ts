import { Document, Types } from "mongoose";

export type UserRole = "candidate" | "employer";

export type ApplicationStatus =
  | "Applied"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Rejected";

export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship";

export type JobStatus = "open" | "closed";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  company?: string;
  profile?: {
    title?: string;
    bio?: string;
    location?: string;
    phone?: string;
  };
  resumeUrl?: string;
  emailNotifications: {
    applicationReceived: boolean;
    statusChanged: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IJob extends Document {
  employerId: Types.ObjectId;
  company: {
    name: string;
    logoUrl?: string;
  };
  title: string;
  description: string;
  location: string;
  isRemote: boolean;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType: EmploymentType;
  tags: string[];
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  changedBy: Types.ObjectId;
  changedAt: Date;
  note?: string;
}

export interface IApplication extends Document {
  jobId: Types.ObjectId;
  candidateId: Types.ObjectId;
  employerId: Types.ObjectId;
  coverLetter?: string;
  resumeUrl: string;
  status: ApplicationStatus;
  statusHistory: StatusHistoryEntry[];
  isWithdrawn: boolean;
  withdrawnAt?: Date;
  appliedAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface JobSearchQuery extends PaginationQuery {
  q?: string;
  location?: string;
  isRemote?: string;
  salaryMin?: string;
  employmentType?: EmploymentType;
  sort?: "date" | "relevance";
}

export interface CloudinaryUploadSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}
