export interface ShopboxBranch {
  id: string;
  name: string;
  city?: string;
  isClosed: boolean;
}

/** Branch row from GET /branches */
export interface ShopboxBranchItem {
  uid?: number | string | null;
  name?: string | null;
  is_closed?: boolean | number | null;
  address0?: { city_name?: string | null } | null;
}

export interface ShopboxBranchesResponse {
  data?: ShopboxBranchItem[];
}
