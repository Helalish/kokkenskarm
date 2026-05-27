export interface PipelineStage {
  id: string;
  name: string;
  sortOrder: number;
  color: string;
  isTerminal: boolean;
  smsEnabled?: boolean;
  smsTemplate?: string;
}
