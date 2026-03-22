export interface SubmissionNotice {
  id: string;
  label: string;
  title: string;
  date: string;
  detail_url: string;
  is_page: boolean;
  status: "pending" | "rejected" | "approved" | string;
  [property: string]: unknown;
}

export interface SubmissionsData {
  total: number;
  notices: SubmissionNotice[];
}

export interface SubmissionsResponse {
  msg: string;
  data: SubmissionsData;
  [property: string]: unknown;
}

export interface GetSubmissionsParams {
  page: number;
  size: number;
  status?: string;
}

export interface SubmissionDetail {
  id: string;
  label: string;
  title: string;
  date: string;
  detail_url: string;
  is_page: boolean;
  status: string;
  review: string;
  content_text: string;
  attachments: string[];
  created_at: string;
  updated_at: string;
  [property: string]: unknown;
}

export interface SubmissionDetailResponse {
  msg: string;
  data: SubmissionDetail;
  [property: string]: unknown;
}

export interface ReviewSubmissionPayload {
  action: "approved" | "rejected";
  review: string;
}

export interface ReviewSubmissionResponse {
  msg: string;
  data: Record<string, never>;
  [property: string]: unknown;
}
