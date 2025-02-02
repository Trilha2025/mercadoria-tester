export interface MLUser {
  id: string;
  nickname: string;
  email?: string;
}

export interface MLTokenResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
}

export interface MLConnection {
  ml_user_id: string;
  ml_nickname?: string;
  ml_email?: string;
  access_token: string;
  refresh_token: string;
}

export interface Company {
  id: string;
  company_name: string;
  is_active: boolean;
  ml_connection?: MLConnection | null;
}
