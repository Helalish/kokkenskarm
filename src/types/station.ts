export interface StationConfig {
  id: string;
  name: string;
  categoryFilters: string[];
  showAllItems: boolean;
  lockedStageId: string | null; // Kun vis ordrer i dette stadie. null = vis alle.
}
