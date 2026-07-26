export interface ShopboxAccount {
  uid: number;
  username: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  lang: string;
}

export interface ShopboxLoginResponse {
  account: ShopboxAccount;
  accessToken: string;
  crdate?: number;
  tstamp?: number;
}

export interface ShopboxErrorResponse {
  error?: {
    name?: string;
    message?: string;
    code?: number;
    status?: number;
  };
  message?: string;
}
