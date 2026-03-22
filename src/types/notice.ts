export interface NoticeItem {
  id: string;
  label: string;
  title: string;
  date: string;
  detail_url: string;
  is_page: boolean;
  content_text: string;
  attachements: string[];
  [property: string]: unknown;
}

export interface NoticesData {
  notices: NoticeItem[];
  total_returned: number;
  total_label: number;
}

export interface NoticesResponse {
  msg: string;
  data: NoticesData;
  [property: string]: unknown;
}

export interface GetNoticesParams {
  page: number;
  size: number;
  label?: string;
}

export interface DeleteNoticeResponse {
  msg: string;
  data: Record<string, never>;
  [property: string]: unknown;
}

export interface NoticeLabelsData {
  labels: string[];
}

export interface NoticeLabelsResponse {
  msg: string;
  data: NoticeLabelsData;
  [property: string]: unknown;
}
