export interface PipelineStage {
  id: string;
  name: string;
  sortOrder: number;
  color: string;
}

// Full set of statuses the Shopbox KDS API accepts (PATCH body).
export const KDS_API_STATUSES = ["incoming", "in_progress", "ready", "done"] as const;
export type KdsApiStatus = (typeof KDS_API_STATUSES)[number];

// Visible pipeline stages on screen (everything except "done").
export const KDS_STAGE_IDS = ["incoming", "in_progress", "ready"] as const;
export type KdsStageId = (typeof KDS_STAGE_IDS)[number];

export function isKdsStageId(id: string): id is KdsStageId {
  return (KDS_STAGE_IDS as readonly string[]).includes(id);
}
