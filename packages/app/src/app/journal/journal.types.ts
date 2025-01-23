export interface JournalEntry {
  id: number;
  documentId: string;
  message_number: number;
  message_content: string;
  message_subject: string;
  date_message: Date;
  communication_details: string;
  communication_type: string;

  createdAt: Date;
  createdBy?: string;
  creator: string;
  date_decision_delivered: Date | null;
  date_decision: Date | null;

  date_triage: Date | null;
  decision: string;
  department: string;
  is_key_message: boolean;
  operation?: {
    id: number;
    [key: string]: any;
  };
  organization?: {
    id: number;
    [key: string]: any;
  };
  publishedAt: Date;
  sender: string;
  entry_status: 'awaiting_message' | 'awaiting_triage' | 'awaiting_decision' | 'awaiting_completion' | 'completed';
  updatedAt: Date;
  updatedBy?: string;
  visum_decision_deliverer: string;
  visum_decision_receiver: string;
  visum_message: string;
  visum_triage: string;
  visum_decider: string;
  decision_receiver: string;
  decision_sender: string;
  is_drawn_on_map: boolean;
}
