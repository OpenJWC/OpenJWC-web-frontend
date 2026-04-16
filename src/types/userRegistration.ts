export type UserRegistrationStatus =
  | "pending"
  | "rejected"
  | "approved"
  | string;

export interface UserRegistrationItem {
  id: string;
  username: string;
  email: string;
  status: UserRegistrationStatus;
  created_at: string;
  [property: string]: unknown;
}

export interface UserRegistrationsData {
  total: number;
  users: UserRegistrationItem[];
}

export interface UserRegistrationsResponse {
  msg: string;
  data: UserRegistrationsData;
  [property: string]: unknown;
}

export interface UserRegistrationDetail extends UserRegistrationItem {}

export interface UserRegistrationDetailResponse {
  msg: string;
  data: UserRegistrationDetail;
  [property: string]: unknown;
}

export interface ReviewUserRegistrationPayload {
  action: "approved" | "rejected";
  review: string;
}

export interface ReviewUserRegistrationResponse {
  msg: string;
  data: Record<string, never>;
  [property: string]: unknown;
}

export interface GetUserRegistrationsParams {
  page: number;
  size: number;
  status?: string;
}
