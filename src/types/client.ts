export interface ShopboxClient {
  id: string;
  name: string;
  icon?: string | null;
}

export interface PaginatedClients {
  items: ShopboxClient[];
  hasMore: boolean;
  total: number;
}

/** Membership row from GET /clients/myclients */
export interface ShopboxClientMembership {
  client?: number | string | null;
  client0?: {
    uid?: number | string | null;
    name?: string | null;
    logo0?: {
      image_medium?: string | null;
      image_original?: string | null;
    } | null;
  } | null;
}

export interface ShopboxClientsResponse {
  data?: ShopboxClientMembership[];
  meta?: {
    pagination?: {
      total?: number;
      per_page?: number;
      current_page?: number;
      total_pages?: number;
      links?: { next?: string | null };
    };
  };
}
